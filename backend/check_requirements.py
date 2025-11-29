from database import SessionLocal
from models import Major, Course, major_required_courses

db = SessionLocal()

cs = db.query(Major).filter(Major.name == 'Computer Science').first()
if cs:
    courses = db.query(Course).join(
        major_required_courses,
        Course.course_id == major_required_courses.c.course_id
    ).filter(major_required_courses.c.major_id == cs.id).all()

    print(f'CS major has {len(courses)} required courses')
    for c in courses[:10]:
        print(f'  - {c.course_id}: {c.title}')
else:
    print('CS major not found')

db.close()
