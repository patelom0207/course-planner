from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean
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

# Junction table for student's completed courses
student_completed_courses = Table(
    'student_completed_courses',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('student_profiles.id')),
    Column('course_id', String, ForeignKey('courses.course_id'))
)

# Junction table for major requirements
major_required_courses = Table(
    'major_required_courses',
    Base.metadata,
    Column('major_id', Integer, ForeignKey('majors.id')),
    Column('course_id', String, ForeignKey('courses.course_id')),
    Column('is_core', Boolean, default=True)  # True for core, False for elective
)

# Junction table for minor requirements
minor_required_courses = Table(
    'minor_required_courses',
    Base.metadata,
    Column('minor_id', Integer, ForeignKey('minors.id')),
    Column('course_id', String, ForeignKey('courses.course_id')),
    Column('is_core', Boolean, default=True)
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

class Major(Base):
    __tablename__ = "majors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    department = Column(String, nullable=False)
    total_credits_required = Column(Integer, nullable=False)
    description = Column(String)

    required_courses = relationship("Course", secondary=major_required_courses)

class Minor(Base):
    __tablename__ = "minors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    department = Column(String, nullable=False)
    total_credits_required = Column(Integer, nullable=False)
    description = Column(String)

    required_courses = relationship("Course", secondary=minor_required_courses)

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    major_id = Column(Integer, ForeignKey('majors.id'), nullable=False)
    ap_credits = Column(String)  # JSON string of AP exam credits
    dual_enrollment_credits = Column(String)  # JSON string of dual enrollment courses

    major = relationship("Major")
    minors = relationship("Minor", secondary="student_minors")
    completed_courses = relationship("Course", secondary=student_completed_courses)
    degree_plan = relationship("DegreePlan", back_populates="student", uselist=False)

# Junction table for student minors
student_minors = Table(
    'student_minors',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('student_profiles.id')),
    Column('minor_id', Integer, ForeignKey('minors.id'))
)

class DegreePlan(Base):
    __tablename__ = "degree_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('student_profiles.id'), nullable=False)

    student = relationship("StudentProfile", back_populates="degree_plan")
    planned_semesters = relationship("PlannedSemester", back_populates="degree_plan")

class PlannedSemester(Base):
    __tablename__ = "planned_semesters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    degree_plan_id = Column(Integer, ForeignKey('degree_plans.id'), nullable=False)
    semester_name = Column(String, nullable=False)  # e.g., "Fall 2025"
    semester_order = Column(Integer, nullable=False)  # 1, 2, 3, etc.

    degree_plan = relationship("DegreePlan", back_populates="planned_semesters")
    courses = relationship("Course", secondary="planned_semester_courses")

# Junction table for planned semester courses
planned_semester_courses = Table(
    'planned_semester_courses',
    Base.metadata,
    Column('planned_semester_id', Integer, ForeignKey('planned_semesters.id')),
    Column('course_id', String, ForeignKey('courses.course_id'))
)

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

# Schemas for degree planning
class MajorSchema(BaseModel):
    id: int
    name: str
    department: str
    total_credits_required: int
    description: Optional[str] = None

    class Config:
        from_attributes = True

class MinorSchema(BaseModel):
    id: int
    name: str
    department: str
    total_credits_required: int
    description: Optional[str] = None

    class Config:
        from_attributes = True

class APCredit(BaseModel):
    exam_name: str
    score: int
    course_equivalents: List[str]  # List of course IDs this AP credit satisfies

class DualEnrollmentCourse(BaseModel):
    college_name: str
    course_number: str
    course_name: str
    credits: int
    uiuc_equivalent: Optional[str] = None  # UIUC course ID equivalent

class StudentProfileCreate(BaseModel):
    name: str
    major_id: int
    minor_ids: List[int] = []
    ap_credits: List[APCredit] = []
    dual_enrollment_courses: List[DualEnrollmentCourse] = []
    use_dashboard_semesters: bool = True  # Whether to pull courses from existing semesters

class StudentProfileSchema(BaseModel):
    id: int
    name: str
    major: MajorSchema
    minors: List[MinorSchema] = []
    completed_courses: List[CourseSchema] = []
    ap_credits: Optional[str] = None
    dual_enrollment_credits: Optional[str] = None

    class Config:
        from_attributes = True

class PlannedSemesterSchema(BaseModel):
    id: int
    semester_name: str
    semester_order: int
    courses: List[CourseSchema] = []

    class Config:
        from_attributes = True

class DegreePlanSchema(BaseModel):
    id: int
    student_id: int
    planned_semesters: List[PlannedSemesterSchema] = []

    class Config:
        from_attributes = True

class GenerateDegreePlanRequest(BaseModel):
    student_id: int
    start_semester: str  # e.g., "Fall 2025"
    start_year: int
    courses_per_semester: int = 4  # Default to 4 courses per semester
