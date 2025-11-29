import { useState, useEffect } from 'react';
import type {
  Major, Minor, Course, Semester, StudentProfile, DegreePlan,
  APCredit, DualEnrollmentCourse
} from '../types';
import { api } from '../api';
import { AP_EXAMS } from '../data/apCredits';
import './DegreePlanner.css';

interface DegreePlannerProps {
  courses: Course[];
  semesters: Semester[];
}

type Step = 'info' | 'ap-credits' | 'dual-enrollment' | 'review' | 'view-plan';

function DegreePlanner({ courses, semesters }: DegreePlannerProps) {
  const [majors, setMajors] = useState<Major[]>([]);
  const [minors, setMinors] = useState<Minor[]>([]);
  const [degreePlan, setDegreePlan] = useState<DegreePlan | null>(null);

  // Form state
  const [step, setStep] = useState<Step>('info');
  const [name, setName] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [selectedMinorIds, setSelectedMinorIds] = useState<number[]>([]);

  // AP Credits
  const [selectedAPExams, setSelectedAPExams] = useState<Map<string, number>>(new Map());

  // Dual Enrollment
  const [dualEnrollmentCourses, setDualEnrollmentCourses] = useState<DualEnrollmentCourse[]>([]);
  const [deCollegeName, setDeCollegeName] = useState('');
  const [deCourseNumber, setDeCourseNumber] = useState('');
  const [deCourseName, setDeCourseName] = useState('');
  const [deCredits, setDeCredits] = useState(3);
  const [deEquivalent, setDeEquivalent] = useState('');

  const [startSemester, setStartSemester] = useState<'Fall' | 'Spring'>('Fall');
  const [startYear, setStartYear] = useState(2026);
  const [coursesPerSemester, setCoursesPerSemester] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMajorsAndMinors();
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

  const toggleMinor = (minorId: number) => {
    if (selectedMinorIds.includes(minorId)) {
      setSelectedMinorIds(selectedMinorIds.filter(id => id !== minorId));
    } else {
      setSelectedMinorIds([...selectedMinorIds, minorId]);
    }
  };

  const toggleAPExam = (examName: string, score: number) => {
    const newMap = new Map(selectedAPExams);
    if (newMap.has(examName)) {
      newMap.delete(examName);
    } else {
      newMap.set(examName, score);
    }
    setSelectedAPExams(newMap);
  };

  const addDualEnrollmentCourse = () => {
    if (!deCollegeName || !deCourseNumber || !deCourseName) {
      setError('Please fill in all dual enrollment course fields');
      return;
    }

    const newCourse: DualEnrollmentCourse = {
      college_name: deCollegeName,
      course_number: deCourseNumber,
      course_name: deCourseName,
      credits: deCredits,
      uiuc_equivalent: deEquivalent || undefined,
    };

    setDualEnrollmentCourses([...dualEnrollmentCourses, newCourse]);

    // Reset form
    setDeCollegeName('');
    setDeCourseNumber('');
    setDeCourseName('');
    setDeCredits(3);
    setDeEquivalent('');
    setError(null);
  };

  const removeDualEnrollmentCourse = (index: number) => {
    setDualEnrollmentCourses(dualEnrollmentCourses.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name || !selectedMajorId) {
      setError('Please enter your name and select a major');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build AP credits array
      const apCredits: APCredit[] = Array.from(selectedAPExams.entries()).map(([examName, score]) => {
        const exam = AP_EXAMS.find(e => e.name === examName);
        return {
          exam_name: examName,
          score,
          course_equivalents: exam?.courseEquivalents || [],
        };
      });

      // Create profile
      const profile = await api.createStudentProfile({
        name,
        major_id: selectedMajorId,
        minor_ids: selectedMinorIds,
        ap_credits: apCredits,
        dual_enrollment_courses: dualEnrollmentCourses,
        use_dashboard_semesters: true, // Always pull from dashboard
      });

      // Generate degree plan
      const plan = await api.generateDegreePlan({
        student_id: profile.id,
        start_semester: startSemester,
        start_year: startYear,
        courses_per_semester: coursesPerSemester,
      });

      setDegreePlan(plan);
      setStep('view-plan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCredits = (plannedSemester: DegreePlan['planned_semesters'][0]) => {
    return plannedSemester.courses.reduce((sum, course) => sum + course.credits, 0);
  };

  const getTotalCoursesFromDashboard = () => {
    return semesters.reduce((total, sem) => total + sem.courses.length, 0);
  };

  const getAPCreditCount = () => {
    let count = 0;
    selectedAPExams.forEach((score, examName) => {
      const exam = AP_EXAMS.find(e => e.name === examName);
      if (exam) count += exam.courseEquivalents.length;
    });
    return count;
  };

  const getDECreditCount = () => {
    return dualEnrollmentCourses.filter(c => c.uiuc_equivalent).length;
  };

  // Step 1: Basic Info
  if (step === 'info') {
    return (
      <div className="degree-planner">
        <h2>Create Your Degree Plan</h2>
        <p className="description">
          Let's build a personalized plan to complete your degree. We'll use your existing Dashboard semesters plus any transfer credits.
        </p>

        {semesters.length > 0 && (
          <div className="info-box">
            <h4>✓ Found {getTotalCoursesFromDashboard()} courses from your Dashboard</h4>
            <p>We'll automatically include these as completed courses.</p>
          </div>
        )}

        {semesters.length === 0 && (
          <div className="warning-box">
            <h4>No Dashboard Semesters Found</h4>
            <p>
              If you've already taken courses at UIUC, please add them to your Dashboard first.
              Otherwise, continue to create a full 4-year plan.
            </p>
          </div>
        )}

        <form className="profile-form">
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

          <button
            type="button"
            onClick={() => setStep('ap-credits')}
            className="btn-primary"
            disabled={!name || !selectedMajorId}
          >
            Next: AP Credits
          </button>
        </form>
      </div>
    );
  }

  // Step 2: AP Credits
  if (step === 'ap-credits') {
    return (
      <div className="degree-planner">
        <button onClick={() => setStep('info')} className="btn-back">
          ← Back
        </button>

        <h2>AP Credits</h2>
        <p className="description">
          Select any AP exams you've taken with a qualifying score. We'll automatically apply the UIUC course equivalents.
        </p>

        <div className="ap-exams-grid">
          {AP_EXAMS.map((exam) => (
            <div key={exam.name} className="ap-exam-card">
              <label className="ap-exam-label">
                <input
                  type="checkbox"
                  checked={selectedAPExams.has(exam.name)}
                  onChange={() => toggleAPExam(exam.name, exam.minScore)}
                />
                <div className="ap-exam-info">
                  <strong>{exam.name}</strong>
                  <span className="ap-score">Score {exam.minScore}+</span>
                  <span className="ap-equivalent">
                    → {exam.courseEquivalents.join(', ')} ({exam.credits} credits)
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={() => setStep('dual-enrollment')}
            className="btn-primary"
          >
            Next: Dual Enrollment
          </button>
          <button
            type="button"
            onClick={() => setStep('dual-enrollment')}
            className="btn-secondary"
          >
            Skip AP Credits
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Dual Enrollment
  if (step === 'dual-enrollment') {
    return (
      <div className="degree-planner">
        <button onClick={() => setStep('ap-credits')} className="btn-back">
          ← Back
        </button>

        <h2>Dual Enrollment / Transfer Credits</h2>
        <p className="description">
          Add any college courses you took outside of UIUC and their UIUC equivalents (if applicable).
        </p>

        {dualEnrollmentCourses.length > 0 && (
          <div className="de-courses-list">
            <h4>Added Courses:</h4>
            {dualEnrollmentCourses.map((course, index) => (
              <div key={index} className="de-course-item">
                <div>
                  <strong>{course.college_name}</strong> - {course.course_number}: {course.course_name}
                  {course.uiuc_equivalent && (
                    <span className="de-equivalent"> → {course.uiuc_equivalent}</span>
                  )}
                </div>
                <button onClick={() => removeDualEnrollmentCourse(index)} className="btn-remove">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <form className="de-form" onSubmit={(e) => { e.preventDefault(); addDualEnrollmentCourse(); }}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>College Name *</label>
              <input
                type="text"
                value={deCollegeName}
                onChange={(e) => setDeCollegeName(e.target.value)}
                placeholder="e.g., Parkland College"
              />
            </div>

            <div className="form-group">
              <label>Course Number *</label>
              <input
                type="text"
                value={deCourseNumber}
                onChange={(e) => setDeCourseNumber(e.target.value)}
                placeholder="e.g., MATH 151"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Course Name *</label>
            <input
              type="text"
              value={deCourseName}
              onChange={(e) => setDeCourseName(e.target.value)}
              placeholder="e.g., Calculus I"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Credits</label>
              <input
                type="number"
                value={deCredits}
                onChange={(e) => setDeCredits(Number(e.target.value))}
                min="1"
                max="6"
              />
            </div>

            <div className="form-group">
              <label>UIUC Equivalent (optional)</label>
              <input
                type="text"
                value={deEquivalent}
                onChange={(e) => setDeEquivalent(e.target.value)}
                placeholder="e.g., MATH220"
              />
            </div>
          </div>

          <button type="submit" className="btn-secondary">
            + Add Course
          </button>
        </form>

        <div className="button-group">
          <button
            type="button"
            onClick={() => setStep('review')}
            className="btn-primary"
          >
            Next: Review
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Review & Generate
  if (step === 'review') {
    const selectedMajor = majors.find(m => m.id === selectedMajorId);
    const selectedMinorsData = minors.filter(m => selectedMinorIds.includes(m.id));

    return (
      <div className="degree-planner">
        <button onClick={() => setStep('dual-enrollment')} className="btn-back">
          ← Back
        </button>

        <h2>Review Your Information</h2>
        <p className="description">
          Review your information below, then generate your degree plan.
        </p>

        <div className="review-summary">
          <div className="review-section">
            <h3>Basic Information</h3>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Major:</strong> {selectedMajor?.name}</p>
            {selectedMinorsData.length > 0 && (
              <p><strong>Minors:</strong> {selectedMinorsData.map(m => m.name).join(', ')}</p>
            )}
          </div>

          <div className="review-section">
            <h3>Completed Credits Summary</h3>
            <p><strong>Dashboard Courses:</strong> {getTotalCoursesFromDashboard()} courses</p>
            <p><strong>AP Credits:</strong> {getAPCreditCount()} courses</p>
            <p><strong>Dual Enrollment:</strong> {getDECreditCount()} courses</p>
            <p className="total-credits">
              <strong>Total Completed:</strong> {getTotalCoursesFromDashboard() + getAPCreditCount() + getDECreditCount()} courses
            </p>
          </div>

          <div className="review-section">
            <h3>Plan Settings</h3>
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
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleSubmit}
          className="btn-primary generate-btn"
          disabled={loading}
        >
          {loading ? 'Generating Plan...' : 'Generate My Degree Plan'}
        </button>
      </div>
    );
  }

  // Step 5: View Plan
  if (step === 'view-plan' && degreePlan) {
    return (
      <div className="degree-planner">
        <h2>{name}'s Degree Plan</h2>

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

          <button
            onClick={() => {
              setStep('info');
              setDegreePlan(null);
            }}
            className="btn-secondary"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default DegreePlanner;
