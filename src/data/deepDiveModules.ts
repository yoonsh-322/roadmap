import { MajorId } from '../types/stem';

export interface DeepDiveModule {
  id: string;
  majorId: MajorId;
  title: string;
  englishTitle: string;
  summary: string;
  difficulty: '중급' | '고급' | '심화';
  keyConcepts: {
    name: string;
    description: string;
    coreFormulasOrPrinciples?: string[];
  }[];
  relatedCourses: {
    code: string;
    name: string;
    role: '선수 기초' | '핵심 연계' | '심화 확장';
  }[];
  recommendedResources: {
    category: '도서/명저' | '오픈강의' | '논문/ArXiv' | '툴/프레임워크';
    title: string;
    description: string;
    authorOrSource: string;
  }[];
  projectIdeas: {
    title: string;
    difficulty: '초급' | '중급' | '도전적';
    targetRole: string;
    techStack: string[];
    overview: string;
    milestones: string[];
    expectedOutcome: string;
  }[];
}

export const DEEP_DIVE_MODULES: DeepDiveModule[] = [
  // Computer Science & AI
  {
    id: 'cs-llm-transformer',
    majorId: 'cs',
    title: '대규모 언어모델(LLM)과 트랜스포머 아키텍처 심화',
    englishTitle: 'Large Language Models & Deep Transformer Architectures',
    summary: '어텐션 메커니즘의 수학적 원리, Multi-Head Attention, RoPE(Rotary Position Embedding), FlashAttention 최적화 및 LoRA 파인튜닝을 깊이 있게 학습합니다.',
    difficulty: '고급',
    keyConcepts: [
      {
        name: 'Scaled Dot-Product Attention & Multi-Head Attention',
        description: '입력 토큰 벡터들 간의 유사도를 Query, Key, Value 내적으로 계산하고 Softmax 정규화를 통해 가중합을 도출하는 핵심 알고리즘입니다.',
        coreFormulasOrPrinciples: [
          'Attention(Q, K, V) = softmax((QK^T) / sqrt(d_k)) * V',
          'MultiHead(Q,K,V) = Concat(head_1, ..., head_h) * W_O',
        ],
      },
      {
        name: 'FlashAttention & GPU 메모리 계층 최적화',
        description: 'HBM(고대역폭 메모리)과 SRAM 간의 I/O 병목을 Tiling 기법과 온라인 Softmax 재계산으로 줄여 O(N^2) 메모리 사용량을 O(N)으로 절감합니다.',
      },
      {
        name: 'LoRA (Low-Rank Adaptation) & PEFT 기법',
        description: '거대 가중치 행렬 W0을 동결하고, 저차원 분해 행렬 B*A(rank r << d)만을 학습시켜 파라미터 효율성을 극대화합니다.',
        coreFormulasOrPrinciples: ['h = W_0 * x + (alpha / r) * B * A * x'],
      },
    ],
    relatedCourses: [
      { code: 'cs-math2', name: '선형대수학', role: '선수 기초' },
      { code: 'cs-deeplearning', name: '딥러닝과 신경망', role: '핵심 연계' },
      { code: 'cs-nlp', name: '자연어처리 및 LLM', role: '심화 확장' },
    ],
    recommendedResources: [
      {
        category: '논문/ArXiv',
        title: 'Attention Is All You Need (Vaswani et al., 2017)',
        description: '현대 생성형 AI와 트랜스포머의 근본이 된 시초 논문',
        authorOrSource: 'Google Research',
      },
      {
        category: '오픈강의',
        title: 'Stanford CS25: Transformers United V4',
        description: '최신 트랜스포머 아키텍처 연구 동향을 다루는 스탠퍼드 공개 세미나',
        authorOrSource: 'Stanford University',
      },
      {
        category: '도서/명저',
        title: '밑바닥부터 만드는 컴퓨팅 시스템 & 딥러닝 2',
        description: '어텐션과 RNN을 파이썬 넘파이만으로 직접 구현해보는 명저',
        authorOrSource: '사이토 고키',
      },
      {
        category: '툴/프레임워크',
        title: 'Hugging Face Transformers & vLLM',
        description: '고속 추론 엔진 및 오픈소스 모델 서빙 프레임워크',
        authorOrSource: 'vLLM Project',
      },
    ],
    projectIdeas: [
      {
        title: 'PyTorch 기반 Nano-Transformer 및 BPE 토크나이저 밑바닥부터 구현',
        difficulty: '중급',
        targetRole: 'AI/ML 리서치 엔지니어',
        techStack: ['Python', 'PyTorch', 'Hugging Face Datasets', 'Weights & Biases'],
        overview: '외부 라이브러리 추상화 없이 Multi-Head Attention, LayerNorm, Residual Connection, BPE 토크나이저를 손수 작성하여 소형 언어모델을 학습시킵니다.',
        milestones: [
          'Byte-Pair Encoding 토크나이저 구현 및 어휘집 사전 구축',
          'Self-Attention 및 Causal Masking 모듈 텐서 연산 구현',
          'WikiText-2 데이터셋으로 사전학습(Pre-training) 진행 및 Perplexity 측정',
          'Top-k / Top-p(Nucleus) 샘플링 디코더 작성 및 텍스트 생성 테스트',
        ],
        expectedOutcome: 'GitHub 포트폴리오로 트랜스포머의 내부 작동 구조를 완벽히 증명할 수 있는 깔끔한 리포지토리 및 기술 블로그 포스팅',
      },
    ],
  },
  {
    id: 'cs-distributed-system',
    majorId: 'cs',
    title: '고성능 분산 시스템 & 동시성 백엔드 엔지니어링',
    englishTitle: 'Distributed Systems & High-Concurrency Backend Architecture',
    summary: 'Raft 분산 합의 알고리즘, CAP 정리, 분산 트랜잭션(2PC, SAGA), 고성능 논블로킹 I/O(epoll) 및 캐시 정합성을 다룹니다.',
    difficulty: '심화',
    keyConcepts: [
      {
        name: 'Raft Consensus Algorithm (합의 알고리즘)',
        description: '리더 선출(Leader Election), 로그 복제(Log Replication), 안전성(Safety)을 분리하여 직관적이면서도 강력한 내결함성 분산 합의를 달성합니다.',
      },
      {
        name: 'CAP Theorem & 분산 데이터 저장소 일관성',
        description: '네트워크 분할(Partition tolerance) 상황에서 일관성(Consistency)과 가용성(Availability) 간의 트레이드오프 및 최종 일관성(Eventual Consistency) 모델.',
      },
      {
        name: 'Epoll & Reactor Pattern 비동기 이벤트 루프',
        description: '수만 개의 동시 소켓 연결을 스레드 생성 비용 없이 I/O 멀티플렉싱으로 단일 이벤트 루프에서 처리하는 원리.',
      },
    ],
    relatedCourses: [
      { code: 'cs-os', name: '운영체제', role: '선수 기초' },
      { code: 'cs-network', name: '컴퓨터 네트워크', role: '선수 기초' },
      { code: 'cs-database', name: '데이터베이스 시스템', role: '핵심 연계' },
    ],
    recommendedResources: [
      {
        category: '도서/명저',
        title: '데이터 중심 애플리케이션 설계 (DDIA)',
        description: '분산 시스템 엔지니어의 바이블로 불리는 마틴 클레프만의 필독서',
        authorOrSource: 'Martin Kleppmann',
      },
      {
        category: '오픈강의',
        title: 'MIT 6.824: Distributed Systems',
        description: 'Go 언어로 Raft 합의 엔진과 분산 KV 저장소를 작성하는 명강의',
        authorOrSource: 'MIT EECS (Robert Morris)',
      },
    ],
    projectIdeas: [
      {
        title: 'Go 언어로 직접 구현하는 Raft 기반 고가용성 분산 Key-Value 스토어',
        difficulty: '도전적',
        targetRole: '분산 백엔드/인프라 엔지니어',
        techStack: ['Go', 'gRPC', 'Protobuf', 'Docker'],
        overview: '여러 대의 노드에서 네트워크 장애, 리더 노드 다운, 메시지 지연이 발생해도 데이터 유실 없이 동작하는 분산 저장소를 만듭니다.',
        milestones: [
          'Heartbeat 타이머 및 Randomized Election Timeout 구현',
          '클라이언트 요청의 Log Replay 및 다수결 커밋 확인 로직 작성',
          '스냅샷 및 로그 압축(Log Compaction) 기능 추가',
          '카오스 테스트(임의 노드 강제 종료) 환경에서 일관성 검증',
        ],
        expectedOutcome: '빅테크/유니콘 백엔드 기술면접에서 면접관을 매료시키는 심도 있는 시스템 엔지니어링 프로젝트',
      },
    ],
  },

  // Electrical & Electronic Engineering
  {
    id: 'ee-vlsi-ic',
    majorId: 'ee',
    title: '최신 반도체 소자(GAA/FinFET) 및 고성능 디지털 VLSI 설계',
    englishTitle: 'Advanced Semiconductor Devices (GAA) & Digital VLSI Design',
    summary: '단채널 효과(SCE) 극복을 위한 3D 채널 구조, CMOS 로직 게이트 지연시간(Elmore Delay), Setup/Hold 타이밍 최적화 및 Verilog RTL 설계를 다룹니다.',
    difficulty: '심화',
    keyConcepts: [
      {
        name: 'Gate-All-Around (GAA) & 나노시트 소자 물리',
        description: '기존 FinFET의 3면 제어를 넘어 4면 전체를 게이트가 감싸 누설 전류를 획기적으로 억제하는 3나노 이하 첨단 공정 기술.',
      },
      {
        name: 'Static Timing Analysis (STA) & 클록 스큐/지터',
        description: '클록 주기 내에 플립플롭 간 데이터가 도달하는 시간(T_cq + T_comb + T_setup <= T_clk)과 Hold 마진을 분석하는 핵심 설계 기법.',
        coreFormulasOrPrinciples: [
          'Setup Slack = T_clk - (T_cq + T_comb_max + T_setup)',
          'Hold Slack = (T_cq + T_comb_min) - T_hold',
        ],
      },
    ],
    relatedCourses: [
      { code: 'ee-circuits2', name: '전자회로 I', role: '선수 기초' },
      { code: 'ee-semi', name: '반도체 소자공학', role: '핵심 연계' },
      { code: 'ee-vlsi', name: '디지털 집적회로 설계', role: '심화 확장' },
    ],
    recommendedResources: [
      {
        category: '도서/명저',
        title: 'CMOS VLSI Design: A Circuits and Systems Perspective',
        description: '디지털 반도체 집적회로 설계의 정석 교재',
        authorOrSource: 'Weste & Harris',
      },
      {
        category: '도서/명저',
        title: 'Physics of Semiconductor Devices',
        description: '반도체 소자 물리의 최고 권위서',
        authorOrSource: 'S. M. Sze',
      },
    ],
    projectIdeas: [
      {
        title: 'Verilog HDL 기반 5단계 파이프라인 RISC-V 코어 설계 및 FPGA 검증',
        difficulty: '도전적',
        targetRole: '반도체 RTL 설계 / 팹리스 엔지니어',
        techStack: ['Verilog HDL', 'ModelSim', 'Vivado', 'Xilinx FPGA'],
        overview: 'RV32I 기본 명령어셋을 지원하는 5-Stage Pipelined CPU를 하드웨어 기술 언어로 설계하고 Data Hazard(포워딩)를 해결합니다.',
        milestones: [
          'IF, ID, EX, MEM, WB 5단계 파이프라인 레지스터 설계',
          '데이터 해저드 해결을 위한 Forwarding Unit 및 Hazard Detection Unit 작성',
          '분기 예측(Branch Prediction) 기본 로직 추가',
          'Testbench 작성 및 C 코드로 작성한 정렬 알고리즘 실행 검증',
        ],
        expectedOutcome: '삼성전자 파운드리/시스템LSI 또는 팹리스 기업 기술면접에서 하드웨어 이해도를 입증하는 핵심 포트폴리오',
      },
    ],
  },

  // Mechanical Engineering
  {
    id: 'me-autonomous-robotics',
    majorId: 'me',
    title: '자율주행 로보틱스 기구학, SLAM & 모델 예측 제어(MPC)',
    englishTitle: 'Robotics Kinematics, SLAM & Model Predictive Control',
    summary: 'DH 파라미터 기반 매니퓰레이터 기구학, LiDAR/비전 기반 자율주행 SLAM 및 차량 동역학 모델 기반 MPC 제어를 마스터합니다.',
    difficulty: '고급',
    keyConcepts: [
      {
        name: 'Denavit-Hartenberg (D-H) 파라미터 & 순/역기구학',
        description: '다관절 로봇 팔의 각 링크 간 상대 좌표계를 4가지 파라미터(a, alpha, d, theta)의 동차변환 행렬(Homogeneous Matrix)로 수학적 모델링합니다.',
      },
      {
        name: 'Model Predictive Control (MPC, 모델 예측 제어)',
        description: '차량 또는 로봇의 물리 동역학 모델을 사용해 미래 시점의 궤적을 실시간 최적화하여 조향각과 가속도를 산출하는 제어 기법.',
      },
      {
        name: 'LiDAR Cartographer / Fast-LIO SLAM',
        description: '미지의 환경에서 센서 데이터를 통해 주변 지도를 작성함과 동시에 로봇 자신의 위치를 추정하는 핵심 알고리즘.',
      },
    ],
    relatedCourses: [
      { code: 'me-dynamics', name: '동역학', role: '선수 기초' },
      { code: 'ee-control', name: '제어공학', role: '선수 기초' },
      { code: 'me-robotics', name: '로봇공학 및 기구학', role: '핵심 연계' },
    ],
    recommendedResources: [
      {
        category: '도서/명저',
        title: 'Introduction to Robotics: Mechanics and Control',
        description: '로봇공학 학부 및 대학원생의 필수 기본서',
        authorOrSource: 'John J. Craig',
      },
      {
        category: '툴/프레임워크',
        title: 'ROS 2 (Robot Operating System) & Gazebo',
        description: '업계 표준 로봇 소프트웨어 프레임워크 및 물리 시뮬레이터',
        authorOrSource: 'Open Robotics',
      },
    ],
    projectIdeas: [
      {
        title: 'ROS 2 및 Gazebo 환경의 무인 물류 로봇(AMR) 경로 생성 및 MPC 추종 시뮬레이션',
        difficulty: '중급',
        targetRole: '자율주행/로보틱스 제어 엔지니어',
        techStack: ['C++', 'Python', 'ROS 2 Humble', 'Gazebo', 'Nav2', 'Eigen'],
        overview: '2D 라이다와 휠 오도메트리를 융합하여 2D SLAM 맵을 작성하고, A* 전역 경로와 MPC 국소 경로 추종기를 직접 구축합니다.',
        milestones: [
          'URDF로 차동 구동(Differential Drive) 모바일 로봇 기구학 모델링',
          'Slam-toolbox 노드를 활용한 실시간 그리드 맵핑',
          'C++로 자전거 모델 기반 MPC 제어기 작성 및 궤적 오차 최소화',
          '장애물 회피 테스트 및 시뮬레이션 주행 영상 제작',
        ],
        expectedOutcome: '현대차 모빌리티 연구원, 로봇 스타트업 포트폴리오용 주행 영상 및 코드베이스',
      },
    ],
  },

  // Chemical & Materials Engineering
  {
    id: 'chem-battery-tech',
    majorId: 'chem_mat',
    title: '차세대 리튬이온 & 전고체 배터리 전기화학 엔지니어링',
    englishTitle: 'Next-Gen Li-Ion & Solid-State Battery Electrochemical Engineering',
    summary: 'NCM 삼원계 양극재, 실리콘 음극재의 부피 팽창 제어, 고체 전해질 계면 저항(SEI) 및 배터리 열화 진단(EIS)을 탐구합니다.',
    difficulty: '고급',
    keyConcepts: [
      {
        name: '고체 전해질 계면 (SEI, Solid Electrolyte Interphase)',
        description: '첫 번째 충전 시 전해액이 환원 분해되며 음극 표면에 형성되는 보호 피막으로, 쿨롱 효율과 수명 안정성을 결정짓는 핵심 계면 현상.',
      },
      {
        name: '전기화학 임피던스 분광법 (EIS, Electrochemical Impedance Spectroscopy)',
        description: '다양한 주파수의 교류 신호를 인가하여 나이퀴스트 선도(Nyquist Plot)를 얻고 옴 저항, 전하이동 저항(Rct), 워버그 확산 임피던스를 분석.',
      },
    ],
    relatedCourses: [
      { code: 'chem-physical', name: '물리화학', role: '선수 기초' },
      { code: 'chem-battery', name: '전기화학 및 배터리 공학', role: '핵심 연계' },
    ],
    recommendedResources: [
      {
        category: '도서/명저',
        title: 'Electrochemical Methods: Fundamentals and Applications',
        description: '전기화학 분야의 독보적인 고전 명저',
        authorOrSource: 'Allen J. Bard',
      },
    ],
    projectIdeas: [
      {
        title: '파이썬 기반 리튬이온 배터리 열화 데이터 분석 및 잔여 수명(RUL) 예측 모델링',
        difficulty: '중급',
        targetRole: '2차전지 BMS / 셀 평가 엔지니어',
        techStack: ['Python', 'Pandas', 'Scikit-Learn', 'Matplotlib'],
        overview: 'NASA 또는 공개 배터리 충방전 사이클 데이터를 활용해 충전 용량 감소 및 내부 저항 증가 곡선을 분석하고 RUL을 머신러닝으로 추정합니다.',
        milestones: [
          'NASA 배터리 사이클 시계열 데이터 수집 및 전처리',
          'dQ/dV (차동 용량 분석) 피크 이동 추출로 퇴화 모드 분석',
          'Random Forest / XGBoost 기반 수명 예측 회귀 모델 학습',
          '보고서 작성: 화학적 열화 메커니즘과 데이터 분석 결과 매핑',
        ],
        expectedOutcome: '배터리 3사(LG/삼성/SK) R&D 서류 및 직무면접에서 강력한 차별점을 부여하는 직무 분석 리포트',
      },
    ],
  },

  // Biological Sciences & Bioengineering
  {
    id: 'bio-alphafold-drug',
    majorId: 'bio',
    title: 'AI 기반 단백질 구조 예측(AlphaFold) & 컴퓨터 기반 신약 발굴',
    englishTitle: 'AI-Driven Protein Structure Prediction & Computational Drug Discovery',
    summary: '단백질 서열로부터 3차원 구조를 예측하는 딥러닝 기법, 분자 도킹(Molecular Docking), 표적 단백질-리간드 결합 자유에너지 시뮬레이션을 다룹니다.',
    difficulty: '심화',
    keyConcepts: [
      {
        name: 'Evoformer & IPA (Invariant Point Attention)',
        description: '다중 서열 정렬(MSA) 정보와 잔기 쌍(Residue Pair) 표현 간의 상호작용을 통해 3차원 유클리드 좌표의 회전/이동 불변성을 보존하며 구조를 예측합니다.',
      },
      {
        name: '분자 도킹 (Molecular Docking) & 스코어링 함수',
        description: '신약 후보 물질(리간드)이 표적 단백질 활성 자리에 결합할 때의 최적 포즈를 탐색하고 결합 친화도(Binding Affinity)를 평가.',
      },
    ],
    relatedCourses: [
      { code: 'bio-biochem', name: '생화학', role: '선수 기초' },
      { code: 'bio-mol', name: '분자생물학', role: '핵심 연계' },
    ],
    recommendedResources: [
      {
        category: '논문/ArXiv',
        title: 'Highly accurate protein structure prediction with AlphaFold (Jumper et al., Nature 2021)',
        description: '단백질 접힘 문제의 50년 난제를 해결한 네이처 논문',
        authorOrSource: 'DeepMind',
      },
    ],
    projectIdeas: [
      {
        title: 'AutoDock Vina와 PyMOL을 활용한 항암 표적 단백질-신약 후보물질 결합 시뮬레이션',
        difficulty: '중급',
        targetRole: 'AI 신약개발 연구원 / 생물정보학 분석가',
        techStack: ['Python', 'AutoDock Vina', 'PyMOL', 'RDKit', 'PDB 데이터베이스'],
        overview: 'PDB에서 표적 단백질 구조를 가져와 FDA 승인 화합물 라이브러리를 가상 스크리닝(Virtual Screening)하여 결합 에너지가 우수한 분자를 발굴합니다.',
        milestones: [
          'PDB에서 표적 단백질 다운로드 및 수소 첨가, 리간드 격자 박스 정의',
          'RDKit으로 화합물 구조(SMILES) 3D 최적화 및 PDBQT 포맷 변환',
          'Vina 도킹 시뮬레이션 수행 및 상위 바인딩 친화도 분자 선정',
          'PyMOL로 수소 결합 및 소수성 상호작용 3D 시각화 리포트 작성',
        ],
        expectedOutcome: '제약 바이오 기업 R&D 및 대학원 연구실 지원 시 돋보이는 계산생물학 포트폴리오',
      },
    ],
  },
];
