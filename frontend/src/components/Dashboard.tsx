import { useState } from 'react';
import type { Semester, Course } from '../types';
import SemesterCard from './SemesterCard';
import './Dashboard.css';

interface DashboardProps {
  semesters: Semester[];
  courses: Course[];
  onCreateSemester: (name: string) => void;
  onDeleteSemester: (semesterId: number) => void;
  onAddCourse: (semesterId: number, courseId: string) => void;
  onRemoveCourse: (semesterId: number, courseId: string) => void;
}

function Dashboard({
  semesters,
  courses,
  onCreateSemester,
  onDeleteSemester,
  onAddCourse,
  onRemoveCourse,
}: DashboardProps) {
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Generate semester options
  const currentYear = new Date().getFullYear();
  const semesterOptions = [];
  for (let year = currentYear; year <= currentYear + 5; year++) {
    semesterOptions.push(`Spring ${year}`);
    semesterOptions.push(`Summer ${year}`);
    semesterOptions.push(`Fall ${year}`);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSemester) {
      onCreateSemester(selectedSemester);
      setSelectedSemester('');
      setShowForm(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>My Semester Plans</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Semester'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="semester-form">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="semester-select"
            autoFocus
          >
            <option value="">Select a semester...</option>
            {semesterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary" disabled={!selectedSemester}>
            Create
          </button>
        </form>
      )}

      {semesters.length === 0 ? (
        <div className="empty-state">
          <p>No semesters planned yet. Create your first semester to get started!</p>
        </div>
      ) : (
        <div className="semesters-grid">
          {semesters.map((semester) => (
            <SemesterCard
              key={semester.id}
              semester={semester}
              courses={courses}
              onDeleteSemester={onDeleteSemester}
              onAddCourse={onAddCourse}
              onRemoveCourse={onRemoveCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
