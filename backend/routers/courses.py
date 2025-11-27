from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Course, CourseSchema

router = APIRouter()

@router.get("/", response_model=List[CourseSchema])
def get_all_courses(
    department: str = None,
    level: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course)

    if department:
        query = query.filter(Course.department == department)

    if level:
        query = query.filter(Course.level == level)

    courses = query.all()
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.course_id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course

@router.get("/departments/list")
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Course.department).distinct().all()
    return {"departments": [dept[0] for dept in departments]}
