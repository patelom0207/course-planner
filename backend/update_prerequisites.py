"""
Update course prerequisites from the cs_degree_requirements.json file.
"""

import json
import os
from database import SessionLocal
from models import Course


def update_prerequisites():
    """Load prerequisites from JSON and update courses in database."""
    db = SessionLocal()

    try:
        # Load prerequisites from JSON
        json_path = os.path.join(os.path.dirname(__file__), "data", "cs_degree_requirements.json")

        if not os.path.exists(json_path):
            print(f"ERROR: {json_path} not found")
            return 1

        with open(json_path, 'r') as f:
            requirements_data = json.load(f)

        course_meta = requirements_data.get('course_meta', {})

        print(f"Updating prerequisites for {len(course_meta)} courses...")
        updated_count = 0

        for course_id, meta in course_meta.items():
            prereqs = meta.get('prerequisites', [])

            # Get course from database
            course = db.query(Course).filter(Course.course_id == course_id).first()

            if course:
                # Store prerequisites as JSON array
                course.prerequisites = json.dumps(prereqs) if prereqs else None
                updated_count += 1
                print(f"  {course_id}: {prereqs if prereqs else 'no prerequisites'}")
            else:
                print(f"  WARNING: {course_id} not found in database")

        db.commit()
        print(f"\n✓ Successfully updated {updated_count} courses with prerequisite information!")
        return 0

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    exit(update_prerequisites())
