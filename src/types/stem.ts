export type MajorId = 'cs' | 'ee' | 'me' | 'chem_mat' | 'bio' | 'math_ai';

export type CourseCategory = 
  | 'basic_science_math' // 기초과학/수학
  | 'major_foundation'   // 전공기초
  | 'major_required'     // 전공필수
  | 'major_elective'     // 전공선택/심화
  | 'capstone_research'; // 캡스톤/연구/실험

export interface Course {
  id: string;
  name: string;
  englishName: string;
  credits: number;
  year: number; // 1, 2, 3, 4
  semester: 1 | 2; // 1학기 or 2학기
  category: CourseCategory;
  categoryLabel: string;
  prerequisites: string[]; // Course IDs
  coreTopics: string[];
  difficulty: 1 | 2 | 3 | 4 | 5; // 1(쉬움) ~ 5(매우도전적)
  workload: 1 | 2 | 3 | 4 | 5;   // 과제 및 학습량
  tips: string;
  recommendedBooks: string[];
  track?: string[]; // e.g. ['AI/데이터', '시스템']
}

export interface TrackInfo {
  id: string;
  name: string;
  description: string;
  recommendedCareers: string[];
  coreCourses: string[]; // Course IDs
}

export interface MajorData {
  id: MajorId;
  name: string;
  englishName: string;
  iconName: string;
  badgeColor: string;
  accentColor: string;
  description: string;
  graduationRequirement: {
    totalCredits: number;
    majorRequiredCredits: number;
    majorElectiveCredits: number;
    generalCredits: number;
  };
  tracks: TrackInfo[];
  courses: Course[];
}

export interface StudentProfile {
  majorId: MajorId;
  currentYear: number;
  currentSemester: 1 | 2;
  targetGpa: number;
  currentGpa: number;
  completedCourseIds: string[];
  plannedCourseIds: string[];
  selectedTrack?: string;
  careerGoal: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type MentorPersona = 'senior_mentor' | 'lab_professor' | 'career_consultant';

export interface PersonaConfig {
  id: MentorPersona;
  title: string;
  badge: string;
  avatarIcon: string;
  description: string;
  systemPrompt: string;
}
