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
  const [newSemesterName, setNewSemesterName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSemesterName.trim()) {
      onCreateSemester(newSemesterName.trim());
      setNewSemesterName('');
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
          <input
            type="text"
            value={newSemesterName}
            onChange={(e) => setNewSemesterName(e.target.value)}
            placeholder="e.g., Fall 2025"
            autoFocus
          />
          <button type="submit" className="btn-primary">Create</button>
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
