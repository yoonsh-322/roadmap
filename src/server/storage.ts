import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');

export interface BackendStorageData {
  profile: {
    majorId: string;
    currentYear: number;
    currentSemester: number;
    targetGpa: number;
    currentGpa: number;
    completedCourseIds: string[];
    plannedCourseIds: string[];
    careerGoal: string;
  };
  qaPosts: Array<{
    id: string;
    authorMajor: string;
    authorYear: string;
    title: string;
    content: string;
    tags: string[];
    mentorId?: string;
    answer?: {
      mentorName: string;
      mentorAffiliation: string;
      content: string;
      date: string;
    };
    createdAt: string;
    upvotes: number;
  }>;
  savedPlans: Array<{
    id: string;
    title: string;
    major: string;
    year: number;
    semester: number;
    careerGoal: string;
    planContent: string;
    createdAt: string;
  }>;
  chatHistory: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  checklist: Record<string, boolean>;
}

const DEFAULT_DATA: BackendStorageData = {
  profile: {
    majorId: 'cs',
    currentYear: 2,
    currentSemester: 2,
    targetGpa: 3.9,
    currentGpa: 3.65,
    completedCourseIds: [
      'cs-calc1',
      'cs-prog1',
      'cs-phys1',
      'cs-calc2',
      'cs-prog2',
      'cs-math1',
      'cs-ds',
      'cs-math2',
    ],
    plannedCourseIds: ['cs-algo', 'cs-arch', 'cs-prob'],
    careerGoal: '국내외 명문 대학원 진학 (석사/석박통합/전문연구요원)',
  },
  qaPosts: [
    {
      id: 'qa-1',
      authorMajor: '컴퓨터공학과',
      authorYear: '2학년',
      title: '자료구조 끝나고 알고리즘이랑 컴퓨터구조를 같이 듣는 게 무리일까요?',
      content: '이번 학기에 자료구조를 수강했고, 다음 학기에 알고리즘(전필)과 컴퓨터구조(전필), 그리고 선형대수학까지 3개를 같이 넣으려고 합니다. 과제나 시험 로드가 감당 가능할지 선배님들의 조언 부탁드립니다!',
      tags: ['수강신청', '컴공', '알고리즘', '컴퓨터구조'],
      mentorId: 'mentor-1',
      answer: {
        mentorName: '김도현 멘토',
        mentorAffiliation: '카이스트 AI 대학원 석박통합',
        content: '충분히 도전해볼 만하며, 컴공 2학년 2학기의 정석적인 핵심 조합입니다! 다만 알고리즘 과제는 매주 백준 골드 수준의 과제가 쏟아져 나오므로 주당 20시간 이상 확보하세요.',
        date: '2026.03.20',
      },
      createdAt: '2026.03.19',
      upvotes: 42,
    },
    {
      id: 'qa-2',
      authorMajor: '전자전기공학부',
      authorYear: '3학년',
      title: '학부연구생을 3학년 1학기 vs 3학년 2학기 언제 컨택하는 게 가장 좋을까요?',
      content: '대학원 진학을 희망하고 있습니다. 반도체 회로설계 랩실에 들어가고 싶은데, 아직 전자회로 I만 듣고 전자회로 II는 안 들은 상태입니다. 과목을 다 듣고 컨택해야 할지, 미리 가야 할까요?',
      tags: ['학부연구생', '반도체', '대학원', '랩실컨택'],
      mentorId: 'mentor-3',
      answer: {
        mentorName: '최민준 멘토',
        mentorAffiliation: '삼성전자 메모리사업부',
        content: '무조건 3학년 1학기 지금 당장 컨택하는 것을 강력 추천합니다! 연구실 교수님들은 기초기가 있는 학생이 와서 배우기를 기대합니다.',
        date: '2026.03.22',
      },
      createdAt: '2026.03.21',
      upvotes: 56,
    },
  ],
  savedPlans: [],
  chatHistory: [],
  checklist: {
    'c-1': true,
    'c-2': true,
    'c-3': false,
    'c-4': false,
    'c-5': false,
  },
};

// Ensure directory and file exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
  }
}

export function readStorage(): BackendStorageData {
  try {
    initStorage();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading backend storage:', err);
    return DEFAULT_DATA;
  }
}

export function writeStorage(data: BackendStorageData): void {
  try {
    initStorage();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing backend storage:', err);
  }
}
