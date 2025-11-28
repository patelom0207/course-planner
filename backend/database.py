from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Course
import requests
import xml.etree.ElementTree as ET

DATABASE_URL = "sqlite:///./course_planner.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def fetch_uiuc_courses():
    """Fetch courses from UIUC Course Explorer API"""
    courses = []

    # Use current year and fall semester
    year = "2025"
    semester = "fall"

    # List of popular departments to fetch
    departments = ["CS", "MATH", "PHYS", "ECE", "STAT", "CHEM", "BIO", "ECON", "PSYC", "ENG"]

    print(f"Fetching courses from UIUC Course Explorer API for {semester} {year}...")

    for dept in departments:
        try:
            url = f"https://courses.illinois.edu/cisapp/explorer/schedule/{year}/{semester}/{dept}.xml"
            print(f"Fetching {dept} courses from {url}")

            response = requests.get(url, timeout=10)

            if response.status_code == 200:
                root = ET.fromstring(response.content)

                # Parse XML and extract courses
                for course_elem in root.findall('.//course'):
                    course_id_elem = course_elem.get('id')

                    if course_id_elem:
                        # Get course details
                        try:
                            detail_url = f"https://courses.illinois.edu/cisapp/explorer/schedule/{year}/{semester}/{dept}/{course_id_elem}.xml"
                            detail_response = requests.get(detail_url, timeout=10)

                            if detail_response.status_code == 200:
                                detail_root = ET.fromstring(detail_response.content)

                                # Extract course information
                                title = detail_root.findtext('label', '').strip()
                                description = detail_root.findtext('description', '').strip()
                                credit_hours = detail_root.findtext('creditHours', '3')

                                # Parse credit hours (can be a range like "3 or 4")
                                try:
                                    credits = int(credit_hours.split()[0])
                                except (ValueError, IndexError):
                                    credits = 3

                                # Determine course level from course number
                                try:
                                    level = int(course_id_elem[0]) * 100
                                except (ValueError, IndexError):
                                    level = 100

                                course_data = {
                                    "course_id": f"{dept}{course_id_elem}",
                                    "title": title[:255] if title else f"{dept} {course_id_elem}",
                                    "credits": credits,
                                    "department": dept,
                                    "level": level,
                                    "description": description[:500] if description else None,
                                    "prerequisites": None  # Would need additional parsing
                                }

                                courses.append(course_data)
                                print(f"  Added: {course_data['course_id']} - {course_data['title']}")

                        except Exception as e:
                            print(f"  Error fetching details for {dept}{course_id_elem}: {e}")
                            continue

            else:
                print(f"  Failed to fetch {dept}: Status {response.status_code}")

        except Exception as e:
            print(f"  Error fetching {dept}: {e}")
            continue

    print(f"\nTotal courses fetched: {len(courses)}")
    return courses

def init_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    existing_courses = db.query(Course).first()
    if existing_courses:
        print("Database already contains courses. Skipping initialization.")
        db.close()
        return

    # Fetch courses from UIUC API
    try:
        uiuc_courses = fetch_uiuc_courses()

        if not uiuc_courses:
            print("No courses fetched from API, using fallback sample data...")
            # Fallback to sample courses if API fails
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
            ]
    except Exception as e:
        print(f"Error fetching courses from API: {e}")
        print("Using fallback sample data...")
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
        ]

    for course_data in uiuc_courses:
        course = Course(**course_data)
        db.add(course)

    db.commit()
    print(f"Successfully added {len(uiuc_courses)} courses to database!")
    db.close()
