import { useState } from 'react';
import type { Course, Semester } from '../types';
import './CourseCatalog.css';

interface CourseCatalogProps {
  courses: Course[];
  departments: string[];
  semesters: Semester[];
  onAddCourse: (semesterId: number, courseId: string) => void;
}

function CourseCatalog({ courses, departments, semesters, onAddCourse }: CourseCatalogProps) {
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingCourse, setAddingCourse] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | ''>('');

  // Show courses if department is selected OR if user is searching
  const filteredCourses = (selectedDept || searchTerm) ? courses.filter((course) => {
    const matchesDept = !selectedDept || course.department === selectedDept;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;

    // Remove spaces from both search term and course data for matching
    const normalizedSearch = searchTerm.toLowerCase().replace(/\s+/g, '');
    const normalizedCourseId = course.course_id.toLowerCase().replace(/\s+/g, '');
    const normalizedTitle = course.title.toLowerCase();

    const matchesSearch = !searchTerm ||
      normalizedCourseId.includes(normalizedSearch) ||
      normalizedTitle.includes(searchTerm.toLowerCase());

    return matchesDept && matchesLevel && matchesSearch;
  }) : [];

  const handleAddCourse = (courseId: string) => {
    if (selectedSemester) {
      onAddCourse(Number(selectedSemester), courseId);
      setAddingCourse(null);
      setSelectedSemester('');
    }
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
    <div className="course-catalog">
      <div className="catalog-header">
        <h2>Course Catalog {selectedDept && `- ${selectedDept} (${filteredCourses.length} courses)`}</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="filter-select"
          >
            <option value="">Select a department...</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value ? Number(e.target.value) : '')}
            className="filter-select"
          >
            <option value="">All Levels</option>
            <option value="100">100-level</option>
            <option value="200">200-level</option>
            <option value="300">300-level</option>
            <option value="400">400-level</option>
          </select>
        </div>
      </div>

      <div className="courses-grid">
        {!selectedDept && !searchTerm ? (
          <p className="no-results">Please select a department or start searching to view courses.</p>
        ) : filteredCourses.length === 0 ? (
          <p className="no-results">No courses found matching your criteria.</p>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.course_id}
              className="catalog-course-card"
              style={{ borderLeftColor: getDepartmentColor(course.department) }}
            >
              <div className="course-card-header">
                <div>
                  <h3>{course.course_id}</h3>
                  <span className="course-level">{course.department} {course.level}</span>
                </div>
                <span className="course-credits-badge">{course.credits} credits</span>
              </div>

              <h4 className="course-card-title">{course.title}</h4>

              {course.description && (
                <p className="course-card-description">{course.description}</p>
              )}

              {course.prerequisites && (
                <p className="course-prerequisites">
                  <strong>Prerequisites:</strong> {course.prerequisites}
                </p>
              )}

              {addingCourse === course.course_id ? (
                <div className="add-to-semester">
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : '')}
                    className="semester-select"
                  >
                    <option value="">Select semester...</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                  <div className="add-actions">
                    <button
                      onClick={() => handleAddCourse(course.course_id)}
                      disabled={!selectedSemester}
                      className="btn-primary btn-small"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setAddingCourse(null);
                        setSelectedSemester('');
                      }}
                      className="btn-secondary btn-small"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCourse(course.course_id)}
                  className="btn-add-to-semester"
                  disabled={semesters.length === 0}
                  title={semesters.length === 0 ? 'Create a semester first' : 'Add to semester'}
                >
                  + Add to Semester
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CourseCatalog;
