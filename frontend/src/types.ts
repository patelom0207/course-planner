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
