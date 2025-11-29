import { useState, useEffect } from 'react';
import type { Course, Semester } from './types';
import { api } from './api';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CourseCatalog from './components/CourseCatalog';
import DegreePlanner from './components/DegreePlanner';
import './App.css';

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'catalog' | 'planner'>('dashboard');
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

  const handleLogin = () => {
    alert('Login functionality coming soon!');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Navbar
        activeView={activeView}
        onNavigate={setActiveView}
        onLogin={handleLogin}
      />

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
        ) : activeView === 'catalog' ? (
          <CourseCatalog
            courses={courses}
            departments={departments}
            semesters={semesters}
            onAddCourse={handleAddCourse}
          />
        ) : (
          <DegreePlanner
            courses={courses}
            semesters={semesters}
          />
        )}
      </main>
    </div>
  );
}

export default App;
