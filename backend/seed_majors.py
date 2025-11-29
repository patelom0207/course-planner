from database import SessionLocal, engine
from models import Base, Major, Minor, major_required_courses, minor_required_courses, Course

def seed_majors_and_minors():
    """Seed the database with popular UIUC majors and minors"""

    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if majors already exist
        if db.query(Major).count() > 0:
            print("Majors already seeded, skipping...")
            return

        # Create some popular UIUC majors
        majors_data = [
            {
                "name": "Computer Science",
                "department": "CS",
                "total_credits_required": 128,
                "description": "Bachelor of Science in Computer Science"
            },
            {
                "name": "Electrical Engineering",
                "department": "ECE",
                "total_credits_required": 128,
                "description": "Bachelor of Science in Electrical Engineering"
            },
            {
                "name": "Mechanical Engineering",
                "department": "ME",
                "total_credits_required": 128,
                "description": "Bachelor of Science in Mechanical Engineering"
            },
            {
                "name": "Mathematics",
                "department": "MATH",
                "total_credits_required": 120,
                "description": "Bachelor of Science in Mathematics"
            },
            {
                "name": "Statistics",
                "department": "STAT",
                "total_credits_required": 120,
                "description": "Bachelor of Science in Statistics"
            },
            {
                "name": "Physics",
                "department": "PHYS",
                "total_credits_required": 120,
                "description": "Bachelor of Science in Physics"
            },
            {
                "name": "Economics",
                "department": "ECON",
                "total_credits_required": 120,
                "description": "Bachelor of Science in Economics"
            }
        ]

        print("Creating majors...")
        for major_data in majors_data:
            major = Major(**major_data)
            db.add(major)

        db.flush()  # Get IDs for majors

        # Create some popular minors
        minors_data = [
            {
                "name": "Computer Science",
                "department": "CS",
                "total_credits_required": 21,
                "description": "Minor in Computer Science"
            },
            {
                "name": "Mathematics",
                "department": "MATH",
                "total_credits_required": 21,
                "description": "Minor in Mathematics"
            },
            {
                "name": "Statistics",
                "department": "STAT",
                "total_credits_required": 18,
                "description": "Minor in Statistics"
            },
            {
                "name": "Business",
                "department": "BADM",
                "total_credits_required": 18,
                "description": "Minor in Business"
            },
            {
                "name": "Economics",
                "department": "ECON",
                "total_credits_required": 18,
                "description": "Minor in Economics"
            }
        ]

        print("Creating minors...")
        for minor_data in minors_data:
            minor = Minor(**minor_data)
            db.add(minor)

        db.commit()
        print(f"Successfully seeded {len(majors_data)} majors and {len(minors_data)} minors!")

        # Now add some sample required courses for CS major
        print("\nAdding sample required courses for CS major...")
        cs_major = db.query(Major).filter(Major.name == "Computer Science").first()

        # Common CS required courses
        cs_required = [
            "CS100", "CS101", "CS124", "CS125", "CS128", "CS173", "CS211", "CS222",
            "CS225", "CS233", "CS240", "CS257", "CS341", "CS357", "CS374", "CS411",
            "CS421", "CS425", "CS426", "CS427", "CS450", "MATH220", "MATH221",
            "MATH231", "MATH241", "PHYS211", "PHYS212"
        ]

        for course_id in cs_required:
            # Check if course exists in database
            course = db.query(Course).filter(Course.course_id == course_id).first()
            if course:
                db.execute(
                    major_required_courses.insert().values(
                        major_id=cs_major.id,
                        course_id=course_id,
                        is_core=True
                    )
                )
                print(f"  Added {course_id} to CS major requirements")

        db.commit()
        print("Successfully added CS major requirements!")

    except Exception as e:
        print(f"Error seeding majors and minors: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_majors_and_minors()
