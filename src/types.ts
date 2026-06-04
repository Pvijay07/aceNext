export interface Badge {
  id: string;
  title: string;
  icon: string;
  desc: string;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string; // student | mentor | admin
  xp: number;
  streak: number;
  badges: Badge[];
  completedLessons: string[];
  completedLabs: string[];
  completedQuizzes: { id: string; score: number }[];
  jobApplications: {
    id: string;
    company: string;
    role: string;
    status: string; // Applied | Shortlisted | Interview | Selected | Rejected
    date: string;
  }[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  pdfUrl?: string;
  topic: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  category: string;
  title: string;
  description: string;
  thumbnail: string;
  modules: CourseModule[];
  xpReward: number;
}

export interface CodeChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  problem: string;
  initialCode: { [key: string]: string };
  testCases: { input: string; output: string }[];
  hint: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ProjectLab {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  tasks: string[];
  learningObjectives: string[];
}

export interface JobItem {
  id: string;
  company: string;
  logo: string;
  role: string;
  salary: string;
  location: string;
  type: string;
  requirements: string[];
}
