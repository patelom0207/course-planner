from database import SessionLocal, engine
from models import Base, Major, Minor, major_required_courses, minor_required_courses, Course

def seed_majors_and_minors():
    """Seed the database with popular UIUC majors and minors"""

    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if majors already exist
        majors_exist = db.query(Major).count() > 0
        if majors_exist:
            print("Majors already exist, skipping major/minor creation...")
        else:
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

        # Now add required courses for CS major from scraped data
        print("\nLoading CS degree requirements from JSON...")
        cs_major = db.query(Major).filter(Major.name == "Computer Science").first()

        # Load requirements from JSON seed file
        import json
        import os

        json_path = os.path.join(os.path.dirname(__file__), "data", "cs_degree_requirements.json")

        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                requirements_data = json.load(f)

            # Process each requirement group
            for group in requirements_data.get('groups', []):
                group_title = group['title']
                group_courses = group['courses']

                # Determine if this is a core requirement
                # Core groups: Technical Core, Foundational Mathematics, Orientation
                is_core_group = any(keyword in group_title for keyword in [
                    'Core', 'Foundational', 'Orientation', 'Professional Development'
                ])

                print(f"\n  Processing group: {group_title} ({len(group_courses)} courses, core={is_core_group})")

                for course_id in group_courses:
                    # Check if course exists in database
                    course = db.query(Course).filter(Course.course_id == course_id).first()
                    if course:
                        # Check if not already added
                        existing = db.execute(
                            major_required_courses.select().where(
                                (major_required_courses.c.major_id == cs_major.id) &
                                (major_required_courses.c.course_id == course_id)
                            )
                        ).first()

                        if not existing:
                            db.execute(
                                major_required_courses.insert().values(
                                    major_id=cs_major.id,
                                    course_id=course_id,
                                    is_core=is_core_group
                                )
                            )
                            print(f"    Added {course_id}")

            db.commit()
            print("\nSuccessfully added CS major requirements from JSON!")
        else:
            print(f"Warning: JSON file not found at {json_path}")
            print("Run 'python scrape_degree_requirements.py' first to generate requirements.")

            # Fallback to minimal hardcoded list
            print("\nUsing fallback minimal requirements...")
            minimal_cs_required = ["CS124", "CS128", "CS173", "CS225", "MATH220", "MATH231"]
            for course_id in minimal_cs_required:
                course = db.query(Course).filter(Course.course_id == course_id).first()
                if course:
                    db.execute(
                        major_required_courses.insert().values(
                            major_id=cs_major.id,
                            course_id=course_id,
                            is_core=True
                        )
                    )
            db.commit()

    except Exception as e:
        print(f"Error seeding majors and minors: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_majors_and_minors()
