from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Semester, SemesterSchema, SemesterCreate, Course, CourseAdd

router = APIRouter()

@router.get("/", response_model=List[SemesterSchema])
def get_all_semesters(db: Session = Depends(get_db)):
    semesters = db.query(Semester).all()
    return semesters

@router.post("/", response_model=SemesterSchema)
def create_semester(semester_data: SemesterCreate, db: Session = Depends(get_db)):
    semester = Semester(name=semester_data.name)
    db.add(semester)
    db.commit()
    db.refresh(semester)
    return semester

@router.get("/{semester_id}", response_model=SemesterSchema)
def get_semester(semester_id: int, db: Session = Depends(get_db)):
    semester = db.query(Semester).filter(Semester.id == semester_id).first()

    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    return semester

@router.post("/{semester_id}/courses")
def add_course_to_semester(
    semester_id: int,
    course_data: CourseAdd,
    db: Session = Depends(get_db)
):
    semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    course = db.query(Course).filter(Course.course_id == course_data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course in semester.courses:
        raise HTTPException(status_code=400, detail="Course already in semester")

    semester.courses.append(course)
    db.commit()

    total_credits = sum(c.credits for c in semester.courses)

    return {
        "message": "Course added successfully",
        "semester_id": semester_id,
        "course_id": course_data.course_id,
        "total_credits": total_credits
    }

@router.delete("/{semester_id}/courses/{course_id}")
def remove_course_from_semester(
    semester_id: int,
    course_id: str,
    db: Session = Depends(get_db)
):
    semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course not in semester.courses:
        raise HTTPException(status_code=400, detail="Course not in semester")

    semester.courses.remove(course)
    db.commit()

    total_credits = sum(c.credits for c in semester.courses)

    return {
        "message": "Course removed successfully",
        "semester_id": semester_id,
        "course_id": course_id,
        "total_credits": total_credits
    }

@router.delete("/{semester_id}")
def delete_semester(semester_id: int, db: Session = Depends(get_db)):
    semester = db.query(Semester).filter(Semester.id == semester_id).first()

    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    db.delete(semester)
    db.commit()

    return {"message": "Semester deleted successfully"}
