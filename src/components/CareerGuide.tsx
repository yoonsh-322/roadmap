import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Globe2, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Award, 
  Check, 
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { StudentProfile } from '../types/stem';
import { saveChecklistToBackend } from '../utils/api';

interface CareerGuideProps {
  profile: StudentProfile;
  onGoToChat: (prompt: string) => void;
}

export const CareerGuide: React.FC<CareerGuideProps> = ({ profile, onGoToChat }) => {
  const [selectedTrack, setSelectedTrack] = useState<'grad_school' | 'industry' | 'study_abroad' | 'research_inst'>('grad_school');

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'c-1': true,
    'c-2': true,
    'c-3': false,
    'c-4': false,
    'c-5': false,
  });

  // Load backend checklist on mount
  useEffect(() => {
    fetch('/api/storage/all')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.checklist) {
          setChecklist(data.checklist);
        }
      })
      .catch((e) => console.error('Failed to load checklist:', e));
  }, []);

  const toggleCheck = (id: string) => {
    setChecklist((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      saveChecklistToBackend(updated);
      return updated;
    });
  };

  const tracks = [
    {
      id: 'grad_school',
      title: '국내 명문 대학원 (석사 / 석박통합 / 전문연)',
      icon: GraduationCap,
      color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
      tag: '연구직 / R&D 심화 / 병역특례',
      pros: ['깊이 있는 연구 역량 확보', '전문연구요원(군복무 대체) 기회', '대기업 과장급/선임연구원 입사'],
      timeline: '2학년 후반 학점 3.8+ 유지 -> 3학년 여름방학 학부연구생 시작 -> 4학년 1학기 입학 전형 원서 접수',
      requirements: ['학점(GPA) 3.7 이상 권장', '전공 필수/심화 과목 A+ 이수', '연구실 인턴 및 학술대회 포스터 발표 우대'],
    },
    {
      id: 'industry',
      title: '대기업 R&D & 빅테크 테크 엔지니어 취업',
      icon: Briefcase,
      color: 'border-blue-500/40 bg-blue-950/30 text-blue-300',
      tag: '삼성, 현대, SK, 네이버, 카카오 등',
      pros: ['빠른 사회 진출 및 경제적 자립', '실무 대규모 프로덕션 시스템 경험', '엔지니어링 커리어 확장'],
      timeline: '2학년 알고리즘/기초과목 완수 -> 3학년 깃허브 실전 프로젝트/기사 자격증 -> 4학년 상반기 인턴/하반기 공채',
      requirements: ['코딩테스트 (백준 골드 이상) 또는 전공 기사', '트러블슈팅 경험 담긴 GitHub 포트폴리오', '직무 인터뷰 기초'],
    },
    {
      id: 'study_abroad',
      title: '미국/유럽 탑스쿨 유학 (박사 풀펀딩)',
      icon: Globe2,
      color: 'border-purple-500/40 bg-purple-950/30 text-purple-300',
      tag: '글로벌 석박사 / 실리콘밸리 진출',
      pros: ['전 세계 최고 수준의 연구 네트워크', '등록금 전액 면제 + 생활비(Stipend) 지원', '글로벌 테크 기업 취업 기회'],
      timeline: '2학년 높은 학점(4.0+) 관리 -> 3학년 논문 투고 참여 및 토플/GRE 준비 -> 4학년 2학기 SOP 작성 및 원서 접수',
      requirements: ['최상위권 학점(GPA 3.9+)', '학술대회/저널 논문 실적(1~2편)', '교수님 강력한 영문 추천서 3통'],
    },
    {
      id: 'research_inst',
      title: '정부출연연구기관 (KIST, ETRI, ADD 등)',
      icon: Building2,
      color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
      tag: '국가 대형 R&D 프로젝트 / 워라밸',
      pros: ['안정적인 정년 보장 및 훌륭한 워라밸', '국가 전략 기술(우주, 양자, 반도체) 선도 연구', '정부 지원 연구 인프라'],
      timeline: '학부 연구생 경험 -> 석사 학위 취득(출연연 학연과정 추천) -> 박사 또는 선임연구원 공채 채용',
      requirements: ['석사 학위 이상 필수', 'SCI급 국제 학술지 논문 게재', '국가 연구과제 참여 실적'],
    },
  ] as const;

  const currentTrackObj = tracks.find((t) => t.id === selectedTrack) || tracks[0];

  const yearTimelines = [
    {
      year: '1학년',
      goal: '기초과학/수학 및 프로그래밍 기초 체력 다지기',
      tasks: [
        { id: 'c-1', text: '미적분학 I, II 및 일반물리학 A학점 이상 취득' },
        { id: 'c-2', text: '기초 언어(C/Python) 기본 문법 및 문제 해결 습관화' },
        { id: 'c-3', text: '학내 이공계 동아리(알고리즘, 로봇, 회로, 학술 스터디) 참여' },
      ],
    },
    {
      year: '2학년',
      goal: '전공 뼈대 과목(필수) 완벽 소화 & 진로 방향성 탐색',
      tasks: [
        { id: 'c-4', text: '선형대수학, 자료구조, 회로이론, 고체/열역학 등 전필 과목 집중' },
        { id: 'c-5', text: '희망 세부 트랙(AI, 시스템, 반도체, 로봇 등) 탐색 및 관심 교수님 연구실 논문 조사' },
        { id: 'c-6', text: '누적 평점(GPA) 3.8 이상 유지 관리' },
      ],
    },
    {
      year: '3학년',
      goal: '학부 연구생(인턴) 시작 및 실전 프로젝트/스펙 구축',
      tasks: [
        { id: 'c-7', text: '관심 분야 교수님께 컨택 이메일 발송 후 학부연구생 랩 인턴 참여' },
        { id: 'c-8', text: '코딩테스트 골드 달성 또는 전공 기사(정보처리기사, 전기기사 등) 준비' },
        { id: 'c-9', text: '방학 중 기업 하계/동계 인턴십 또는 연구실 세미나 발표' },
      ],
    },
    {
      year: '4학년',
      goal: '캡스톤 종합설계 완성 & 대학원/공채 최종 합격',
      tasks: [
        { id: 'c-10', text: '졸업 캡스톤 디자인 포트폴리오화 (GitHub, 논문 포스터 전시)' },
        { id: 'c-11', text: '대학원 원서 접수 (6월/10월) 또는 기업 하반기 공채 서류/인적성/기술면접' },
        { id: 'c-12', text: '졸업 학점 및 필수 이수 요건 최종 검토' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              STEM Pathways & Career Navigator
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              이공계 진로 가이드 & 학년별 타임라인
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              국내 명문 대학원, 미국/유럽 유학, 테크 기업 취업 및 정부출연연구기관까지 
              자신의 강점에 맞는 진로 트랙을 탐색하고 학년별 액션 플랜을 점검하세요.
            </p>
          </div>
        </div>

        {/* Track Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-800/80">
          {tracks.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTrack === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 ring-1 ring-cyan-400/40 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {t.title.split('(')[0]}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">
                  {t.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Track Detailed Profile */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {currentTrackObj.tag}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              {currentTrackObj.title}
            </h2>
          </div>

          <button
            onClick={() =>
              onGoToChat(
                `진로 트랙 '${currentTrackObj.title}'에 대해 구체적인 준비 전략을 상담받고 싶어. 내 프로필: ${profile.majorId.toUpperCase()} ${profile.currentYear}학년, 목표 GPA: ${profile.targetGpa || 3.8}`
              )
            }
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            이 진로 AI 맞춤 상담하기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 block">✨ 핵심 장점 및 비전</span>
            <ul className="space-y-1.5 text-slate-300">
              {currentTrackObj.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 block">🎯 필수 준비 요건</span>
            <ul className="space-y-1.5 text-slate-300">
              {currentTrackObj.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 block">⏱️ 권장 준비 타임라인</span>
            <p className="text-slate-300 leading-relaxed">
              {currentTrackObj.timeline}
            </p>
          </div>
        </div>
      </div>

      {/* Year-by-Year Interactive Checklist */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          1학년 ~ 4학년 학기별 액션 플랜 체크리스트
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {yearTimelines.map((y) => (
            <div
              key={y.year}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-cyan-300">
                    {y.year}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {y.tasks.filter((t) => checklist[t.id]).length}/{y.tasks.length} 완료
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3 leading-tight font-medium">
                  {y.goal}
                </p>

                <div className="space-y-2">
                  {y.tasks.map((task) => {
                    const isChecked = Boolean(checklist[task.id]);
                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleCheck(task.id)}
                        className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-slate-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            isChecked ? 'text-cyan-400' : 'text-slate-600'
                          }`}
                        />
                        <span className={`text-[11px] leading-snug ${isChecked ? 'line-through text-slate-400' : ''}`}>
                          {task.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
