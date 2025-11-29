import { useState, useEffect } from 'react';
import type { Major, Minor, Course, StudentProfile, DegreePlan } from '../types';
import { api } from '../api';
import './DegreePlanner.css';

interface DegreePlannerProps {
  courses: Course[];
}

function DegreePlanner({ courses }: DegreePlannerProps) {
  const [majors, setMajors] = useState<Major[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [degreePlan, setDegreePlan] = useState<DegreePlan | null>(null);

  // Form state
  const [step, setStep] = useState<'select-profile' | 'create-profile' | 'view-plan'>('select-profile');
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [selectedMinorIds, setSelectedMinorIds] = useState<number[]>([]);
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);
  const [startSemester, setStartSemester] = useState<'Fall' | 'Spring'>('Fall');
  const [startYear, setStartYear] = useState(2026);
  const [coursesPerSemester, setCoursesPerSemester] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMajorsAndMinors();
    loadStudentProfiles();
  }, []);

  const loadMajorsAndMinors = async () => {
    try {
      const [majorsData, minorsData] = await Promise.all([
        api.getAllMajors(),
        api.getAllMinors(),
      ]);
      setMajors(majorsData);
      setMinors(minorsData);
    } catch (err) {
      console.error('Failed to load majors and minors:', err);
    }
  };

  const loadStudentProfiles = async () => {
    try {
      const profiles = await api.getAllStudentProfiles();
      setStudentProfiles(profiles);
    } catch (err) {
      console.error('Failed to load student profiles:', err);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedMajorId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await api.createStudentProfile({
        name,
        major_id: selectedMajorId,
        minor_ids: selectedMinorIds,
        completed_course_ids: completedCourseIds,
      });

      setStudentProfiles([...studentProfiles, profile]);
      setSelectedProfileId(profile.id);
      setStep('view-plan');

      // Generate degree plan
      await generatePlan(profile.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async (studentId: number) => {
    setLoading(true);
    setError(null);

    try {
      const plan = await api.generateDegreePlan({
        student_id: studentId,
        start_semester: startSemester,
        start_year: startYear,
        courses_per_semester: coursesPerSemester,
      });

      setDegreePlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profileId: number) => {
    setSelectedProfileId(profileId);
    setStep('view-plan');

    try {
      const plan = await api.getDegreePlan(profileId);
      setDegreePlan(plan);
    } catch (err) {
      // No plan exists yet, will generate new one
      await generatePlan(profileId);
    }
  };

  const toggleCourse = (courseId: string) => {
    if (completedCourseIds.includes(courseId)) {
      setCompletedCourseIds(completedCourseIds.filter(id => id !== courseId));
    } else {
      setCompletedCourseIds([...completedCourseIds, courseId]);
    }
  };

  const toggleMinor = (minorId: number) => {
    if (selectedMinorIds.includes(minorId)) {
      setSelectedMinorIds(selectedMinorIds.filter(id => id !== minorId));
    } else {
      setSelectedMinorIds([...selectedMinorIds, minorId]);
    }
  };

  const calculateTotalCredits = (plannedSemester: DegreePlan['planned_semesters'][0]) => {
    return plannedSemester.courses.reduce((sum, course) => sum + course.credits, 0);
  };

  if (step === 'select-profile') {
    return (
      <div className="degree-planner">
        <h2>Degree Planner</h2>
        <p className="description">
          Create a personalized degree completion plan based on your major, minors, and completed coursework.
        </p>

        {studentProfiles.length > 0 && (
          <div className="existing-profiles">
            <h3>Existing Profiles</h3>
            <div className="profiles-grid">
              {studentProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="profile-card"
                  onClick={() => handleSelectProfile(profile.id)}
                >
                  <h4>{profile.name}</h4>
                  <p><strong>Major:</strong> {profile.major.name}</p>
                  {profile.minors.length > 0 && (
                    <p><strong>Minors:</strong> {profile.minors.map(m => m.name).join(', ')}</p>
                  )}
                  <p><strong>Completed:</strong> {profile.completed_courses.length} courses</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setStep('create-profile')}
          className="btn-primary create-new-btn"
        >
          + Create New Profile
        </button>
      </div>
    );
  }

  if (step === 'create-profile') {
    return (
      <div className="degree-planner">
        <button onClick={() => setStep('select-profile')} className="btn-back">
          ← Back
        </button>

        <h2>Create Student Profile</h2>

        <form onSubmit={handleCreateProfile} className="profile-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Major *</label>
            <select
              value={selectedMajorId || ''}
              onChange={(e) => setSelectedMajorId(Number(e.target.value))}
              required
            >
              <option value="">Select a major</option>
              {majors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.name} ({major.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Minors (optional)</label>
            <div className="checkbox-group">
              {minors.map((minor) => (
                <label key={minor.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedMinorIds.includes(minor.id)}
                    onChange={() => toggleMinor(minor.id)}
                  />
                  {minor.name} ({minor.department})
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Completed Courses</label>
            <p className="hint">Select all courses you have already completed</p>
            <div className="course-selection">
              {courses.map((course) => (
                <label key={course.course_id} className="checkbox-label course-checkbox">
                  <input
                    type="checkbox"
                    checked={completedCourseIds.includes(course.course_id)}
                    onChange={() => toggleCourse(course.course_id)}
                  />
                  <span>
                    <strong>{course.course_id}</strong> - {course.title} ({course.credits} credits)
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Start Semester</label>
            <select
              value={startSemester}
              onChange={(e) => setStartSemester(e.target.value as 'Fall' | 'Spring')}
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Year</label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              min="2024"
              max="2030"
            />
          </div>

          <div className="form-group">
            <label>Courses Per Semester</label>
            <input
              type="number"
              value={coursesPerSemester}
              onChange={(e) => setCoursesPerSemester(Number(e.target.value))}
              min="1"
              max="6"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Profile & Generate Plan'}
          </button>
        </form>
      </div>
    );
  }

  // View plan step
  const selectedProfile = studentProfiles.find(p => p.id === selectedProfileId);

  return (
    <div className="degree-planner">
      <button onClick={() => setStep('select-profile')} className="btn-back">
        ← Back to Profiles
      </button>

      {selectedProfile && (
        <div className="profile-summary">
          <h2>{selectedProfile.name}'s Degree Plan</h2>
          <div className="profile-info">
            <p><strong>Major:</strong> {selectedProfile.major.name}</p>
            {selectedProfile.minors.length > 0 && (
              <p><strong>Minors:</strong> {selectedProfile.minors.map(m => m.name).join(', ')}</p>
            )}
            <p><strong>Completed Courses:</strong> {selectedProfile.completed_courses.length}</p>
          </div>
        </div>
      )}

      {loading && <p className="loading">Generating degree plan...</p>}
      {error && <div className="error-message">{error}</div>}

      {degreePlan && (
        <div className="degree-plan">
          <h3>Semester Plan</h3>
          <div className="semesters-timeline">
            {degreePlan.planned_semesters.map((semester) => (
              <div key={semester.id} className="planned-semester">
                <div className="semester-header">
                  <h4>{semester.semester_name}</h4>
                  <span className="credit-count">
                    {calculateTotalCredits(semester)} credits
                  </span>
                </div>
                <div className="course-list">
                  {semester.courses.map((course) => (
                    <div key={course.course_id} className="course-item">
                      <div className="course-header">
                        <strong>{course.course_id}</strong>
                        <span className="credits">{course.credits} cr</span>
                      </div>
                      <div className="course-title">{course.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedProfileId && (
            <button
              onClick={() => generatePlan(selectedProfileId)}
              className="btn-secondary regenerate-btn"
              disabled={loading}
            >
              Regenerate Plan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DegreePlanner;
