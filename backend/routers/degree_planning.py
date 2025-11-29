from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from database import get_db
from models import (
    StudentProfile, Major, Minor, DegreePlan, PlannedSemester, Course, Semester,
    StudentProfileCreate, StudentProfileSchema, MajorSchema, MinorSchema,
    DegreePlanSchema, GenerateDegreePlanRequest, student_completed_courses,
    student_minors, major_required_courses, minor_required_courses,
    planned_semester_courses, semester_courses
)

router = APIRouter()

# Major endpoints
@router.get("/majors", response_model=List[MajorSchema])
def get_all_majors(db: Session = Depends(get_db)):
    """Get all available majors"""
    return db.query(Major).all()

@router.get("/majors/{major_id}", response_model=MajorSchema)
def get_major(major_id: int, db: Session = Depends(get_db)):
    """Get a specific major by ID"""
    major = db.query(Major).filter(Major.id == major_id).first()
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")
    return major

# Minor endpoints
@router.get("/minors", response_model=List[MinorSchema])
def get_all_minors(db: Session = Depends(get_db)):
    """Get all available minors"""
    return db.query(Minor).all()

# Student profile endpoints
@router.post("/student-profile", response_model=StudentProfileSchema)
def create_student_profile(profile: StudentProfileCreate, db: Session = Depends(get_db)):
    """Create a new student profile with major, minors, AP credits, dual enrollment, and completed courses"""

    # Verify major exists
    major = db.query(Major).filter(Major.id == profile.major_id).first()
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")

    # Serialize AP credits and dual enrollment to JSON
    ap_credits_json = json.dumps([credit.dict() for credit in profile.ap_credits]) if profile.ap_credits else None
    de_credits_json = json.dumps([course.dict() for course in profile.dual_enrollment_courses]) if profile.dual_enrollment_courses else None

    # Create student profile
    student = StudentProfile(
        name=profile.name,
        major_id=profile.major_id,
        ap_credits=ap_credits_json,
        dual_enrollment_credits=de_credits_json
    )
    db.add(student)
    db.flush()  # Get the student ID

    # Add minors
    if profile.minor_ids:
        for minor_id in profile.minor_ids:
            minor = db.query(Minor).filter(Minor.id == minor_id).first()
            if minor:
                db.execute(
                    student_minors.insert().values(
                        student_id=student.id,
                        minor_id=minor_id
                    )
                )

    # Collect all completed course IDs from multiple sources
    completed_course_ids = set()

    # 1. Add courses from dashboard semesters (if requested)
    if profile.use_dashboard_semesters:
        # Get all courses from all semesters
        dashboard_courses = db.query(Course).join(
            semester_courses,
            Course.course_id == semester_courses.c.course_id
        ).all()
        completed_course_ids.update(c.course_id for c in dashboard_courses)

    # 2. Add AP credit equivalents
    if profile.ap_credits:
        for ap_credit in profile.ap_credits:
            completed_course_ids.update(ap_credit.course_equivalents)

    # 3. Add dual enrollment equivalents
    if profile.dual_enrollment_courses:
        for de_course in profile.dual_enrollment_courses:
            if de_course.uiuc_equivalent:
                completed_course_ids.add(de_course.uiuc_equivalent)

    # Add all completed courses to the student profile
    for course_id in completed_course_ids:
        course = db.query(Course).filter(Course.course_id == course_id).first()
        if course:
            db.execute(
                student_completed_courses.insert().values(
                    student_id=student.id,
                    course_id=course_id
                )
            )

    db.commit()
    db.refresh(student)
    return student

@router.get("/student-profile/{student_id}", response_model=StudentProfileSchema)
def get_student_profile(student_id: int, db: Session = Depends(get_db)):
    """Get a student profile by ID"""
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

@router.get("/student-profiles", response_model=List[StudentProfileSchema])
def get_all_student_profiles(db: Session = Depends(get_db)):
    """Get all student profiles"""
    return db.query(StudentProfile).all()

# Degree plan endpoints
@router.post("/generate-degree-plan", response_model=DegreePlanSchema)
def generate_degree_plan(request: GenerateDegreePlanRequest, db: Session = Depends(get_db)):
    """Generate a degree completion plan for a student"""

    # Get student profile
    student = db.query(StudentProfile).filter(StudentProfile.id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Delete existing degree plan if it exists
    if student.degree_plan:
        db.delete(student.degree_plan)
        db.flush()

    # Create new degree plan
    degree_plan = DegreePlan(student_id=student.id)
    db.add(degree_plan)
    db.flush()

    # Get required courses for major
    major_courses = db.query(Course).join(
        major_required_courses,
        Course.course_id == major_required_courses.c.course_id
    ).filter(major_required_courses.c.major_id == student.major_id).all()

    # Get required courses for minors
    minor_courses = []
    for minor in student.minors:
        courses = db.query(Course).join(
            minor_required_courses,
            Course.course_id == minor_required_courses.c.course_id
        ).filter(minor_required_courses.c.minor_id == minor.id).all()
        minor_courses.extend(courses)

    # Combine all required courses
    all_required = list(set(major_courses + minor_courses))

    # Filter out completed courses
    completed_ids = {c.course_id for c in student.completed_courses}
    remaining_courses = [c for c in all_required if c.course_id not in completed_ids]

    # Build prerequisite map
    prereq_map = {}
    for course in all_required:
        prereq_map[course.course_id] = []
        if course.prerequisites:
            # Parse prerequisites (stored as JSON array or comma-separated)
            import json
            try:
                prereqs = json.loads(course.prerequisites)
                if isinstance(prereqs, list):
                    prereq_map[course.course_id] = prereqs
            except:
                # Fallback to comma-separated
                prereq_map[course.course_id] = [p.strip() for p in course.prerequisites.split(',') if p.strip()]

    # Schedule courses semester by semester using prerequisite-aware algorithm
    semester_names = ["Fall", "Spring"]
    semester_order = 1
    year = request.start_year
    semester_index = 0 if request.start_semester == "Fall" else 1

    scheduled_courses = set(completed_ids)  # Track all completed/scheduled courses
    remaining = {c.course_id: c for c in remaining_courses}

    while remaining:
        # Find courses that can be taken this semester (prerequisites met)
        available = []
        for course_id, course in remaining.items():
            prereqs = prereq_map.get(course_id, [])
            if all(prereq in scheduled_courses for prereq in prereqs):
                available.append(course)

        if not available:
            # No courses available - either cycle in prereqs or all remaining courses need something
            # Just take lowest level courses to break the deadlock
            available = sorted(remaining.values(), key=lambda c: c.level)[:request.courses_per_semester]

        # Sort available courses by level (lower level first) and take up to courses_per_semester
        available.sort(key=lambda c: c.level)
        semester_courses_batch = available[:request.courses_per_semester]

        if not semester_courses_batch:
            break  # No more courses to schedule

        semester_name = f"{semester_names[semester_index]} {year}"

        # Create planned semester
        planned_semester = PlannedSemester(
            degree_plan_id=degree_plan.id,
            semester_name=semester_name,
            semester_order=semester_order
        )
        db.add(planned_semester)
        db.flush()

        # Add courses to planned semester
        for course in semester_courses_batch:
            db.execute(
                planned_semester_courses.insert().values(
                    planned_semester_id=planned_semester.id,
                    course_id=course.course_id
                )
            )
            scheduled_courses.add(course.course_id)
            remaining.pop(course.course_id, None)

        # Move to next semester
        semester_index = (semester_index + 1) % 2
        if semester_index == 1:  # Moving from Fall to Spring increments the year
            year += 1
        semester_order += 1

    db.commit()
    db.refresh(degree_plan)
    return degree_plan

@router.get("/degree-plan/{student_id}", response_model=DegreePlanSchema)
def get_degree_plan(student_id: int, db: Session = Depends(get_db)):
    """Get the degree plan for a student"""
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if not student.degree_plan:
        raise HTTPException(status_code=404, detail="No degree plan found for this student")

    return student.degree_plan
