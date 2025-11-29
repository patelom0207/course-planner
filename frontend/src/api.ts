import type {
  Course, Semester, SemesterCreate, CourseAdd,
  Major, Minor, StudentProfile, StudentProfileCreate,
  DegreePlan, GenerateDegreePlanRequest
} from './types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  async getAllCourses(department?: string, level?: number): Promise<Course[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (level) params.append('level', level.toString());

    const url = `${API_BASE_URL}/courses/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  async getCourse(courseId: string): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`);
    if (!response.ok) throw new Error('Failed to fetch course');
    return response.json();
  },

  async getDepartments(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/courses/departments/list/`);
    if (!response.ok) throw new Error('Failed to fetch departments');
    const data = await response.json();
    return data.departments;
  },

  async getAllSemesters(): Promise<Semester[]> {
    const response = await fetch(`${API_BASE_URL}/semesters/`);
    if (!response.ok) throw new Error('Failed to fetch semesters');
    return response.json();
  },

  async createSemester(semesterData: SemesterCreate): Promise<Semester> {
    const response = await fetch(`${API_BASE_URL}/semesters/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(semesterData),
    });
    if (!response.ok) throw new Error('Failed to create semester');
    return response.json();
  },

  async getSemester(semesterId: number): Promise<Semester> {
    const response = await fetch(`${API_BASE_URL}/semesters/${semesterId}/`);
    if (!response.ok) throw new Error('Failed to fetch semester');
    return response.json();
  },

  async addCourseToSemester(semesterId: number, courseData: CourseAdd) {
    const response = await fetch(`${API_BASE_URL}/semesters/${semesterId}/courses/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add course');
    }
    return response.json();
  },

  async removeCourseFromSemester(semesterId: number, courseId: string) {
    const response = await fetch(`${API_BASE_URL}/semesters/${semesterId}/courses/${courseId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove course');
    return response.json();
  },

  async deleteSemester(semesterId: number) {
    const response = await fetch(`${API_BASE_URL}/semesters/${semesterId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete semester');
    return response.json();
  },

  // Degree planning APIs
  async getAllMajors(): Promise<Major[]> {
    const response = await fetch(`${API_BASE_URL}/degree-planning/majors`);
    if (!response.ok) throw new Error('Failed to fetch majors');
    return response.json();
  },

  async getAllMinors(): Promise<Minor[]> {
    const response = await fetch(`${API_BASE_URL}/degree-planning/minors`);
    if (!response.ok) throw new Error('Failed to fetch minors');
    return response.json();
  },

  async createStudentProfile(profileData: StudentProfileCreate): Promise<StudentProfile> {
    const response = await fetch(`${API_BASE_URL}/degree-planning/student-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Failed to create student profile');
    return response.json();
  },

  async getStudentProfile(studentId: number): Promise<StudentProfile> {
    const response = await fetch(`${API_BASE_URL}/degree-planning/student-profile/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch student profile');
    return response.json();
  },

  async getAllStudentProfiles(): Promise<StudentProfile[]> {
    const response = await fetch(`${API_BASE_URL}/degree-planning/student-profiles`);
    if (!response.ok) throw new Error('Failed to fetch student profiles');
    return response.json();
  },

  async generateDegreePlan(request: GenerateDegreePlanRequest): Promise<DegreePlan> {
    const response = await fetch(`${API_BASE_URL}/degree-planning/generate-degree-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to generate degree plan');
    return response.json();
  },

  async getDegreePlan(studentId: number): Promise<DegreePlan> {
    const response = await fetch(`${API_BASE_URL}/degree-planning/degree-plan/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch degree plan');
    return response.json();
  },
};
