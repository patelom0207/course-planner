// Common AP exams and their UIUC course equivalents
export interface APExam {
  name: string;
  minScore: number;
  courseEquivalents: string[];
  credits: number;
}

export const AP_EXAMS: APExam[] = [
  // Computer Science
  {
    name: "Computer Science A",
    minScore: 5,
    courseEquivalents: ["CS124"],
    credits: 3
  },

  // Mathematics
  {
    name: "Calculus AB",
    minScore: 4,
    courseEquivalents: ["MATH220"],
    credits: 5
  },
  {
    name: "Calculus BC",
    minScore: 4,
    courseEquivalents: ["MATH220", "MATH231"],
    credits: 8
  },
  {
    name: "Statistics",
    minScore: 4,
    courseEquivalents: ["STAT100"],
    credits: 3
  },

  // Sciences
  {
    name: "Physics C: Mechanics",
    minScore: 4,
    courseEquivalents: ["PHYS211"],
    credits: 4
  },
  {
    name: "Physics C: Electricity and Magnetism",
    minScore: 4,
    courseEquivalents: ["PHYS212"],
    credits: 4
  },
  {
    name: "Chemistry",
    minScore: 4,
    courseEquivalents: ["CHEM102"],
    credits: 3
  },
  {
    name: "Biology",
    minScore: 4,
    courseEquivalents: ["BIOL110"],
    credits: 4
  },

  // English
  {
    name: "English Language and Composition",
    minScore: 4,
    courseEquivalents: ["RHET105"],
    credits: 3
  },
  {
    name: "English Literature and Composition",
    minScore: 4,
    courseEquivalents: ["RHET105"],
    credits: 3
  },

  // History & Social Sciences
  {
    name: "U.S. History",
    minScore: 4,
    courseEquivalents: ["HIST172"],
    credits: 3
  },
  {
    name: "European History",
    minScore: 4,
    courseEquivalents: ["HIST142"],
    credits: 3
  },
  {
    name: "World History",
    minScore: 4,
    courseEquivalents: ["HIST172"],
    credits: 3
  },
  {
    name: "Psychology",
    minScore: 4,
    courseEquivalents: ["PSYC100"],
    credits: 4
  },
  {
    name: "Macroeconomics",
    minScore: 4,
    courseEquivalents: ["ECON102"],
    credits: 3
  },
  {
    name: "Microeconomics",
    minScore: 4,
    courseEquivalents: ["ECON103"],
    credits: 3
  },
];
