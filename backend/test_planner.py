"""
Smoke test for degree planner with CS major and completed courses.
"""

from database import SessionLocal
from models import StudentProfile, Major, Course, student_completed_courses
from routers.degree_planning import generate_degree_plan
from models import GenerateDegreePlanRequest


def test_planner():
    """Test planner with CS major and some completed courses."""
    db = SessionLocal()

    try:
        # Get CS major
        cs_major = db.query(Major).filter(Major.name == "Computer Science").first()
        if not cs_major:
            print("ERROR: CS major not found")
            return 1

        print(f"Testing with major: {cs_major.name}")

        # Create test student
        student = StudentProfile(
            name="Test Student",
            major_id=cs_major.id
        )
        db.add(student)
        db.flush()

        # Add some completed courses
        completed = ["CS101", "MATH231"]
        print(f"\nCompleted courses: {completed}")

        for course_id in completed:
            course = db.query(Course).filter(Course.course_id == course_id).first()
            if course:
                db.execute(
                    student_completed_courses.insert().values(
                        student_id=student.id,
                        course_id=course_id
                    )
                )
                print(f"  Added {course_id} as completed")

        db.commit()
        db.refresh(student)

        # Generate degree plan
        print(f"\nGenerating degree plan...")
        request = GenerateDegreePlanRequest(
            student_id=student.id,
            start_semester="Fall",
            start_year=2026,
            courses_per_semester=4
        )

        plan = generate_degree_plan(request, db)

        # Print results
        print(f"\n=== DEGREE PLAN ===")
        print(f"Student: {student.name}")
        print(f"Major: {cs_major.name}")
        print(f"Total semesters: {len(plan.planned_semesters)}")

        for semester in plan.planned_semesters[:5]:  # Show first 5 semesters
            total_credits = sum(c.credits for c in semester.courses)
            print(f"\n{semester.semester_name} ({len(semester.courses)} courses, {total_credits} credits):")
            for course in semester.courses:
                print(f"  - {course.course_id}: {course.title} ({course.credits} cr)")

        if len(plan.planned_semesters) > 5:
            print(f"\n... and {len(plan.planned_semesters) - 5} more semesters")

        print("\n✓ Planner smoke test PASSED")
        print(f"✓ Generated plan with {len(plan.planned_semesters)} semesters")
        return 0

    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    exit(test_planner())
