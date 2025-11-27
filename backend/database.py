from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Course

DATABASE_URL = "sqlite:///./course_planner.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    existing_courses = db.query(Course).first()
    if existing_courses:
        db.close()
        return

    uiuc_courses = [
        {
            "course_id": "CS101",
            "title": "Intro to Computing",
            "credits": 3,
            "department": "CS",
            "level": 100,
            "description": "Introduction to computer science concepts and programming",
            "prerequisites": None
        },
        {
            "course_id": "CS125",
            "title": "Intro to Computer Science",
            "credits": 4,
            "department": "CS",
            "level": 100,
            "description": "Introduction to programming and computer science",
            "prerequisites": None
        },
        {
            "course_id": "CS173",
            "title": "Discrete Structures",
            "credits": 3,
            "department": "CS",
            "level": 100,
            "description": "Discrete mathematical structures and foundations",
            "prerequisites": None
        },
        {
            "course_id": "CS225",
            "title": "Data Structures",
            "credits": 4,
            "department": "CS",
            "level": 200,
            "description": "Fundamental data structures and algorithms",
            "prerequisites": "CS125"
        },
        {
            "course_id": "CS233",
            "title": "Computer Architecture",
            "credits": 4,
            "department": "CS",
            "level": 200,
            "description": "Digital logic design and computer organization",
            "prerequisites": "CS125"
        },
        {
            "course_id": "CS340",
            "title": "Introduction to Computer Systems",
            "credits": 3,
            "department": "CS",
            "level": 300,
            "description": "Systems programming and operating systems concepts",
            "prerequisites": "CS225,CS233"
        },
        {
            "course_id": "CS374",
            "title": "Algorithms and Models of Computation",
            "credits": 4,
            "department": "CS",
            "level": 300,
            "description": "Algorithm design and computational complexity",
            "prerequisites": "CS173,CS225"
        },
        {
            "course_id": "CS411",
            "title": "Database Systems",
            "credits": 3,
            "department": "CS",
            "level": 400,
            "description": "Database design, query languages, and implementation",
            "prerequisites": "CS225"
        },
        {
            "course_id": "CS421",
            "title": "Programming Languages and Compilers",
            "credits": 3,
            "department": "CS",
            "level": 400,
            "description": "Programming language concepts and compiler design",
            "prerequisites": "CS374"
        },
        {
            "course_id": "MATH220",
            "title": "Calculus",
            "credits": 5,
            "department": "MATH",
            "level": 200,
            "description": "Differential and integral calculus",
            "prerequisites": None
        },
        {
            "course_id": "MATH231",
            "title": "Calculus II",
            "credits": 3,
            "department": "MATH",
            "level": 200,
            "description": "Sequences, series, and multivariable calculus",
            "prerequisites": "MATH220"
        },
        {
            "course_id": "MATH241",
            "title": "Calculus III",
            "credits": 4,
            "department": "MATH",
            "level": 200,
            "description": "Multivariable calculus and vector analysis",
            "prerequisites": "MATH231"
        },
        {
            "course_id": "PHYS211",
            "title": "University Physics: Mechanics",
            "credits": 4,
            "department": "PHYS",
            "level": 200,
            "description": "Calculus-based mechanics",
            "prerequisites": "MATH220"
        },
        {
            "course_id": "PHYS212",
            "title": "University Physics: Elec & Mag",
            "credits": 4,
            "department": "PHYS",
            "level": 200,
            "description": "Electricity and magnetism",
            "prerequisites": "PHYS211,MATH231"
        },
        {
            "course_id": "ECE110",
            "title": "Introduction to Electronics",
            "credits": 3,
            "department": "ECE",
            "level": 100,
            "description": "Basic circuit analysis and electronics",
            "prerequisites": None
        },
        {
            "course_id": "ECE220",
            "title": "Computer Systems & Programming",
            "credits": 4,
            "department": "ECE",
            "level": 200,
            "description": "C programming and computer organization",
            "prerequisites": "ECE110"
        },
        {
            "course_id": "STAT400",
            "title": "Statistics and Probability I",
            "credits": 4,
            "department": "STAT",
            "level": 400,
            "description": "Probability theory and statistical inference",
            "prerequisites": "MATH231"
        },
        {
            "course_id": "ENG100",
            "title": "Engineering Orientation",
            "credits": 0,
            "department": "ENG",
            "level": 100,
            "description": "Introduction to engineering disciplines",
            "prerequisites": None
        }
    ]

    for course_data in uiuc_courses:
        course = Course(**course_data)
        db.add(course)

    db.commit()
    db.close()
