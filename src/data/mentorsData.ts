import { MajorId } from '../types/stem';

export interface SeniorMentor {
  id: string;
  name: string;
  majorId: MajorId;
  affiliation: string; // e.g. "카이스트 AI 대학원 석박통합 3년차", "삼성전자 반도체연구소"
  education: string; // e.g. "서울대 컴퓨터공학 학사 (학점 4.18/4.3)"
  specialties: string[];
  bio: string;
  answersCount: number;
  helpfulCount: number;
  badge: string;
  avatarColor: string;
}

export interface SeniorArticle {
  id: string;
  authorId: string;
  authorName: string;
  authorAffiliation: string;
  title: string;
  category: '학점 관리' | '학부연구생' | '취업/인턴' | '대학원/유학';
  readTime: string;
  summary: string;
  content: string;
  likes: number;
  date: string;
}

export interface QAPost {
  id: string;
  authorMajor: string;
  authorYear: string;
  title: string;
  content: string;
  tags: string[];
  mentorId?: string; // target mentor or general
  answer?: {
    mentorName: string;
    mentorAffiliation: string;
    content: string;
    date: string;
  };
  createdAt: string;
  upvotes: number;
}

export const SENIOR_MENTORS: SeniorMentor[] = [
  {
    id: 'mentor-1',
    name: '김도현 멘토',
    majorId: 'cs',
    affiliation: '카이스트 AI 대학원 석박통합 3년차',
    education: '컴퓨터공학과 수석 졸업 (학점 4.22/4.3)',
    specialties: ['학부연구생 컨택', 'CVPR/ICLR 논문 투고', '선형대수/딥러닝 공부법', '카이스트/서울대 대학원'],
    bio: '학부 2학년 때부터 학부연구생으로 연구를 시작해 탑티어 AI 학회에 논문을 발표했습니다. 방황하는 후배들의 든든한 학업 가이드가 되어 드릴게요.',
    answersCount: 142,
    helpfulCount: 520,
    badge: 'AI 연구실 랩장',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'mentor-2',
    name: '박서연 멘토',
    majorId: 'cs',
    affiliation: '네이버/라인 검색 인프라 백엔드 엔지니어',
    education: '컴퓨터공학 학사 (코딩테스트 올솔, 오픈소스 기여)',
    specialties: ['코딩테스트 3개월 완성', '대용량 분산 시스템', '깃허브 포트폴리오 첨삭', '신입 공채 면접'],
    bio: '비전공자/학점 3점대 초반 후배들도 대기업/빅테크 백엔드로 합격시킨 실전 취업 로드맵을 전수합니다.',
    answersCount: 198,
    helpfulCount: 680,
    badge: '빅테크 면접관',
    avatarColor: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'mentor-3',
    name: '최민준 멘토',
    majorId: 'ee',
    affiliation: '삼성전자 메모리사업부 반도체 설계 연구원',
    education: '전자전기공학 학사 (학점 4.15/4.5)',
    specialties: ['전자회로/반도체소자 족보', '삼성 GSAT & 전공 직무면접', '회로설계 RTL/Verilog', '반도체 공정'],
    bio: '전자과의 통곡의 벽인 전자기학과 전자회로를 A+로 정복한 회로 해석 프레임워크를 공유합니다.',
    answersCount: 115,
    helpfulCount: 430,
    badge: '반도체 IC 마스터',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'mentor-4',
    name: '정지훈 멘토',
    majorId: 'me',
    affiliation: '현대자동차 로보틱스랩 / 자율주행 SW 연구원',
    education: '기계공학 학사 + 로봇제어 석사',
    specialties: ['4대 역학 A+ 단권화', 'ROS 2 & 자율주행 제어', '자동차 R&D 산학장학생', '현대차 공채'],
    bio: '기계공학 전공 지식과 프로그래밍(C++/Python)을 융합하여 미래 모빌리티 시장에서 살아남는 법을 알려드립니다.',
    answersCount: 94,
    helpfulCount: 380,
    badge: '모빌리티 제어 멘토',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'mentor-5',
    name: '이수빈 멘토',
    majorId: 'chem_mat',
    affiliation: 'LG에너지솔루션 배터리 선행개발 연구원',
    education: '화학공학/신소재 복수전공 (학점 4.08/4.5)',
    specialties: ['2차전지 배터리 엔지니어', '물리화학/전달현상 정복법', '화학공학 기사', '배터리 3사 취업'],
    bio: '방대한 계산과 유도 과정으로 악명 높은 전달현상과 열역학을 직관적으로 이해하고 시험에서 고득점하는 팁을 나눕니다.',
    answersCount: 88,
    helpfulCount: 310,
    badge: '배터리 셀 전문가',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'mentor-6',
    name: '윤하은 멘토',
    majorId: 'bio',
    affiliation: '미국 존스홉킨스(JHU) 의공학/바이오 석박사과정',
    education: '생명공학 학사 (풀펀딩 해외 장학생)',
    specialties: ['미국 이공계 유학/풀펀딩', '학부생 논문 1저자 작성법', '바이오 인포매틱스', 'GRE/토플'],
    bio: '국내 학부를 졸업하고 미국 명문대 풀펀딩 박사과정에 합격한 SOP(학업계획서) 작성 노하우와 유학 타임라인을 알려드립니다.',
    answersCount: 76,
    helpfulCount: 420,
    badge: '해외 유학 어드바이저',
    avatarColor: 'from-rose-500 to-pink-600',
  },
];

export const SENIOR_ARTICLES: SeniorArticle[] = [
  {
    id: 'art-1',
    authorId: 'mentor-1',
    authorName: '김도현 멘토',
    authorAffiliation: '카이스트 AI 대학원',
    title: '학부연구생 컨택 메일, 교수님이 당일 답장하게 만드는 5단계 공식',
    category: '학부연구생',
    readTime: '4분',
    summary: '단순히 "열심히 배우겠습니다"라고 쓰면 90% 읽씹당합니다. 교수님의 최근 2년치 논문 키워드를 본인의 과목 프로젝트와 엮는 실전 템플릿 공개.',
    content: `많은 학부생들이 실수하는 가장 큰 부분은 '내가 얼마나 교수님을 존경하는지'를 장황하게 적는 것입니다. 교수님들은 바쁩니다. 보고 싶어 하시는 것은 단 두 가지입니다:
1) 이 학생이 내 연구실에서 당장 어떤 기여(손과 발, 혹은 기초 코딩/실험)를 할 수 있는가?
2) 수강한 과목 성적(특히 기초 수학/전공 필수)이 검증되었는가?

따라서 첫 문단에서 신분을 밝힌 뒤, 두 번째 문단에서 교수님의 특정 논문(예: "2024년 CVPR에 발표하신 OOO 논문의 손실함수 개선 아이디어를 감명 깊게 읽었습니다")을 언급하세요. 그리고 세 번째 문단에 본인이 다뤄본 기술(PyTorch, C++, 실험 경험)을 2~3줄로 요약한 CV를 첨부하는 것이 가장 효과적입니다.`,
    likes: 184,
    date: '2026.03.15',
  },
  {
    id: 'art-2',
    authorId: 'mentor-3',
    authorName: '최민준 멘토',
    authorAffiliation: '삼성전자 메모리사업부',
    title: '전자과 4.18 학점 선배의 중간/기말고사 2주 벼락치기 탈출 및 누적 복습법',
    category: '학점 관리',
    readTime: '5분',
    summary: '방대한 회로이론과 공학수학 공식, 무작정 암기하지 마세요. "백지 복습법"과 "문제 유형별 3단계 단권화 노트" 작성 노하우.',
    content: `이공계 시험의 본질은 '새로운 회로나 시스템을 보았을 때 지배 방정식을 세울 수 있는가'입니다.
단순히 교재 솔루션을 눈으로 읽는 것은 공부가 아닙니다. 제가 A+를 싹쓸이한 비결은 '백지 테스트'였습니다.
매주 주말, A4 용지 한 장을 꺼내 놓고 이번 주 배운 핵심 개념(예: 테브난 등가회로 유도 과정, 라플라스 변환 공식 5개)을 기억만으로 씁니다. 막히는 부분이 바로 시험에 나올 약점입니다.
또한 시험 2주 전에는 예제 문제 풀이에 집착하기보다 교수님이 강조하신 유도 과정과 과제 문제를 직접 다시 푸는 데 80%의 시간을 투자하세요.`,
    likes: 247,
    date: '2026.02.28',
  },
  {
    id: 'art-3',
    authorId: 'mentor-2',
    authorName: '박서연 멘토',
    authorAffiliation: '네이버/라인 백엔드',
    title: '학점 3점대 초반에서 코딩테스트 골드 + 실전 프로젝트로 빅테크 뚫은 로드맵',
    category: '취업/인턴',
    readTime: '6분',
    summary: '학점이 낮다고 포기하지 마세요. 백준 300문제 테마별 정복법과 면접관의 눈길을 사로잡는 트러블슈팅 중심 GitHub 리포지토리 구성법.',
    content: `개발자 채용 시장에서 학점은 성실성의 지표일 뿐, 실력을 증명하지 못합니다.
제가 역전한 공식은 다음과 같습니다:
1단계: 자료구조와 알고리즘 기본 유형(BFS/DFS, DP, 투포인터, 그리디) 각 20문제씩 풀기.
2단계: 단순히 기능만 작동하는 CRUD 게시판이 아닌, '동시 접속 1,000명 상황에서 락(Lock) 경합 해결', 'Redis 캐시 정합성 튜닝' 등 기술적 고민이 들어간 프로젝트 1개 완성.
3단계: Readme에 아키텍처 다이어그램과 [성능 개선 전/후 지표]를 명시하기.
이 3가지만 갖추면 어떤 대기업 기술면접에서도 당당하게 주인공으로 대화를 이끌 수 있습니다.`,
    likes: 312,
    date: '2026.01.20',
  },
];

export const INITIAL_QA_POSTS: QAPost[] = [
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
      content: `충분히 도전해볼 만하며, 컴공 2학년 2학기의 정석적인 핵심 조합입니다! 다만 두 가지 주의점이 있습니다:
1) 알고리즘 과제는 매주 백준 골드 수준의 과제가 쏟아져 나오므로 구현 시간이 많이 듭니다.
2) 컴퓨터구조는 어셈블리어(MIPS/RISC-V)와 파이프라이닝을 다루기 때문에 시험 전 암기 및 원리 이해 분량이 꽤 큽니다.
추천 전략: 두 과목 외의 나머지 2~3과목은 교양이나 로드가 가벼운 일반선택 과목으로 배치하여 주당 가용 학습 시간을 최소 20시간 이상 확보하세요. 이 3과목을 잘 끝내면 3학년 운영체제(OS)가 훨씬 쉬워집니다!`,
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
      content: `무조건 **3학년 1학기 지금 당장 컨택**하는 것을 강력 추천합니다!
연구실 교수님들은 학부생이 모든 심화 지식을 알고 올 것이라고 기대하지 않습니다. 전자회로 I과 회로이론 기본기만 잘 닦여 있다면, 랩실에 들어가서 전자회로 II를 수강하면서 연구실 세미나와 논문 리딩을 병행하는 것이 학습 속도가 3배 빠릅니다.
인기 있는 랩실은 3학년 여름방학 전에 TO가 차는 경우가 많으니 지금 컨택해서 "이번 학기 전자회로 II를 수강할 계획이며 랩실에서 기초 논문 스터디부터 성실히 참여하고 싶다"고 어필하세요!`,
      date: '2026.03.22',
    },
    createdAt: '2026.03.21',
    upvotes: 56,
  },
  {
    id: 'qa-3',
    authorMajor: '기계공학부',
    authorYear: '2학년',
    title: '유체역학 나비에-스토크스 방정식 유도가 너무 어렵습니다. 어떻게 공부해야 할까요?',
    content: '미분형 레이놀즈 수송 정리부터 나비에-스토크스 유도하는 과정에서 텐서와 편미분이 너무 복잡하게 얽혀서 시험 문제 풀 때 손이 굳습니다.',
    tags: ['기계공학', '유체역학', '공부법'],
    mentorId: 'mentor-4',
    answer: {
      mentorName: '정지훈 멘토',
      mentorAffiliation: '현대자동차 로보틱스 연구원',
      content: `유체역학의 가장 큰 고비에 오셨군요! 나비에-스토크스를 정복하는 핵심은 **"뉴턴의 제2법칙 F=ma를 유체 덩어리(Control Volume)에 적용한 것뿐이다"**라는 본질을 놓치지 않는 것입니다.
좌변(rho * Du/Dt)은 가속도(질량 * 가속도)이고, 우변은 유체에 작용하는 힘(압력 구배, 점성 마찰력, 중력)의 합입니다.
시험에 나오는 것은 대부분 1차원 정상 유동(Couette flow, Poiseuille flow)이므로 복잡한 전개식을 통째로 외우려 하지 말고, "어떤 항이 0으로 날아가는지(비압축성, 1차원, 정상상태 가정)" 경계조건(Boundary condition)을 적용하는 연습을 반복하세요!`,
      date: '2026.03.25',
    },
    createdAt: '2026.03.24',
    upvotes: 38,
  },
];
