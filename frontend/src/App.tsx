import { useState, useEffect } from 'react';
import type { Course, Semester } from './types';
import { api } from './api';
import Dashboard from './components/Dashboard';
import CourseCatalog from './components/CourseCatalog';
import './App.css';

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'catalog'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [coursesData, semestersData, departmentsData] = await Promise.all([
        api.getAllCourses(),
        api.getAllSemesters(),
        api.getDepartments(),
      ]);
      setCourses(coursesData);
      setSemesters(semestersData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSemester = async (name: string) => {
    try {
      const newSemester = await api.createSemester({ name });
      setSemesters([...semesters, newSemester]);
    } catch (error) {
      console.error('Error creating semester:', error);
      alert('Failed to create semester');
    }
  };

  const handleDeleteSemester = async (semesterId: number) => {
    try {
      await api.deleteSemester(semesterId);
      setSemesters(semesters.filter(s => s.id !== semesterId));
    } catch (error) {
      console.error('Error deleting semester:', error);
      alert('Failed to delete semester');
    }
  };

  const handleAddCourse = async (semesterId: number, courseId: string) => {
    try {
      await api.addCourseToSemester(semesterId, { course_id: courseId });
      const updatedSemester = await api.getSemester(semesterId);
      setSemesters(semesters.map(s => s.id === semesterId ? updatedSemester : s));
    } catch (error: any) {
      console.error('Error adding course:', error);
      alert(error.message || 'Failed to add course');
    }
  };

  const handleRemoveCourse = async (semesterId: number, courseId: string) => {
    try {
      await api.removeCourseFromSemester(semesterId, courseId);
      const updatedSemester = await api.getSemester(semesterId);
      setSemesters(semesters.map(s => s.id === semesterId ? updatedSemester : s));
    } catch (error) {
      console.error('Error removing course:', error);
      alert('Failed to remove course');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>UIUC Course Planner</h1>
        <nav>
          <button
            className={activeView === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={activeView === 'catalog' ? 'active' : ''}
            onClick={() => setActiveView('catalog')}
          >
            Course Catalog
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeView === 'dashboard' ? (
          <Dashboard
            semesters={semesters}
            courses={courses}
            onCreateSemester={handleCreateSemester}
            onDeleteSemester={handleDeleteSemester}
            onAddCourse={handleAddCourse}
            onRemoveCourse={handleRemoveCourse}
          />
        ) : (
          <CourseCatalog
            courses={courses}
            departments={departments}
            semesters={semesters}
            onAddCourse={handleAddCourse}
          />
        )}
      </main>
    </div>
  );
}

export default App;
