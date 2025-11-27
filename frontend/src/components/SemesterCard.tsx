import { useState } from 'react';
import type { Semester, Course } from '../types';
import './SemesterCard.css';

interface SemesterCardProps {
  semester: Semester;
  courses: Course[];
  onDeleteSemester: (semesterId: number) => void;
  onAddCourse: (semesterId: number, courseId: string) => void;
  onRemoveCourse: (semesterId: number, courseId: string) => void;
}

function SemesterCard({
  semester,
  courses,
  onDeleteSemester,
  onAddCourse,
  onRemoveCourse,
}: SemesterCardProps) {
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);

  const availableCourses = courses.filter(
    (course) => !semester.courses.some((c) => c.course_id === course.course_id)
  );

  const handleAddCourse = () => {
    if (selectedCourseId) {
      onAddCourse(semester.id, selectedCourseId);
      setSelectedCourseId('');
      setShowAddCourse(false);
    }
  };

  const checkPrerequisites = (course: Course): string[] => {
    if (!course.prerequisites) return [];

    const requiredCourses = course.prerequisites.split(',').map(c => c.trim());
    const completedCourses = semester.courses.map(c => c.course_id);

    return requiredCourses.filter(req => !completedCourses.includes(req));
  };

  const getDepartmentColor = (dept: string): string => {
    const colors: { [key: string]: string } = {
      CS: '#4A90E2',
      MATH: '#E24A4A',
      PHYS: '#4AE290',
      ECE: '#E2C44A',
      STAT: '#9B4AE2',
      ENG: '#E24A90',
    };
    return colors[dept] || '#888';
  };

  return (
    <div className="semester-card">
      <div className="semester-header">
        <h3>{semester.name}</h3>
        <button
          onClick={() => onDeleteSemester(semester.id)}
          className="btn-delete"
          title="Delete semester"
        >
          ×
        </button>
      </div>

      <div className="semester-credits">
        <strong>Total Credits: {totalCredits}</strong>
      </div>

      <div className="courses-list">
        {semester.courses.length === 0 ? (
          <p className="no-courses">No courses added</p>
        ) : (
          semester.courses.map((course) => {
            const missingPrereqs = checkPrerequisites(course);
            return (
              <div
                key={course.course_id}
                className="course-item"
                style={{ borderLeftColor: getDepartmentColor(course.department) }}
              >
                <div className="course-info">
                  <div className="course-header-row">
                    <strong>{course.course_id}</strong>
                    <span className="course-credits">{course.credits} cr</span>
                  </div>
                  <div className="course-title">{course.title}</div>
                  {missingPrereqs.length > 0 && (
                    <div className="prerequisites-warning">
                      ⚠️ Missing prerequisites: {missingPrereqs.join(', ')}
                    </div>
                  )}
                  {course.description && (
                    <div className="course-description" title={course.description}>
                      {course.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRemoveCourse(semester.id, course.course_id)}
                  className="btn-remove"
                  title="Remove course"
                >
                  Remove
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="semester-actions">
        {!showAddCourse ? (
          <button onClick={() => setShowAddCourse(true)} className="btn-secondary">
            + Add Course
          </button>
        ) : (
          <div className="add-course-form">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="course-select"
            >
              <option value="">Select a course...</option>
              {availableCourses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_id} - {course.title} ({course.credits} cr)
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button onClick={handleAddCourse} className="btn-primary" disabled={!selectedCourseId}>
                Add
              </button>
              <button onClick={() => setShowAddCourse(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SemesterCard;
