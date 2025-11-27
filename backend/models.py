from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship, declarative_base
from pydantic import BaseModel
from typing import List, Optional

Base = declarative_base()

semester_courses = Table(
    'semester_courses',
    Base.metadata,
    Column('semester_id', Integer, ForeignKey('semesters.id')),
    Column('course_id', String, ForeignKey('courses.course_id'))
)

class Course(Base):
    __tablename__ = "courses"

    course_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)
    department = Column(String, nullable=False)
    level = Column(Integer, nullable=False)
    description = Column(String)
    prerequisites = Column(String)

    semesters = relationship("Semester", secondary=semester_courses, back_populates="courses")

class Semester(Base):
    __tablename__ = "semesters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)

    courses = relationship("Course", secondary=semester_courses, back_populates="semesters")

class CourseSchema(BaseModel):
    course_id: str
    title: str
    credits: int
    department: str
    level: int
    description: Optional[str] = None
    prerequisites: Optional[str] = None

    class Config:
        from_attributes = True

class SemesterSchema(BaseModel):
    id: int
    name: str
    courses: List[CourseSchema] = []

    class Config:
        from_attributes = True

class SemesterCreate(BaseModel):
    name: str

class CourseAdd(BaseModel):
    course_id: str
