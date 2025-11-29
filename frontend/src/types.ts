export interface Course {
  course_id: string;
  title: string;
  credits: number;
  department: string;
  level: number;
  description?: string;
  prerequisites?: string;
}

export interface Semester {
  id: number;
  name: string;
  courses: Course[];
}

export interface SemesterCreate {
  name: string;
}

export interface CourseAdd {
  course_id: string;
}

// Degree planning types
export interface Major {
  id: number;
  name: string;
  department: string;
  total_credits_required: number;
  description?: string;
}

export interface Minor {
  id: number;
  name: string;
  department: string;
  total_credits_required: number;
  description?: string;
}

export interface APCredit {
  exam_name: string;
  score: number;
  course_equivalents: string[];
}

export interface DualEnrollmentCourse {
  college_name: string;
  course_number: string;
  course_name: string;
  credits: number;
  uiuc_equivalent?: string;
}

export interface StudentProfile {
  id: number;
  name: string;
  major: Major;
  minors: Minor[];
  completed_courses: Course[];
  ap_credits?: string;
  dual_enrollment_credits?: string;
}

export interface StudentProfileCreate {
  name: string;
  major_id: number;
  minor_ids: number[];
  ap_credits: APCredit[];
  dual_enrollment_courses: DualEnrollmentCourse[];
  use_dashboard_semesters: boolean;
}

export interface PlannedSemester {
  id: number;
  semester_name: string;
  semester_order: number;
  courses: Course[];
}

export interface DegreePlan {
  id: number;
  student_id: number;
  planned_semesters: PlannedSemester[];
}

export interface GenerateDegreePlanRequest {
  student_id: number;
  start_semester: string;
  start_year: number;
  courses_per_semester: number;
}
