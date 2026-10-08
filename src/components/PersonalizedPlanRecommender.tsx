import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Clock, 
  GraduationCap, 
  Layers, 
  Compass, 
  Copy, 
  Check, 
  BookmarkPlus, 
  RefreshCw, 
  Flame, 
  ArrowRight,
  Save,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { STEM_MAJORS } from '../data/stemMajors';
import { MajorId, StudentProfile, Course } from '../types/stem';
import { renderMarkdown } from '../utils/markdown';
import { savePlanToBackend, fetchSavedPlans, deleteSavedPlan, SavedPlan } from '../utils/api';

interface PersonalizedPlanProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  onApplyPlanToPlanner: (courseIds: string[]) => void;
  onGoToChat: (initialMessage: string) => void;
}

export const PersonalizedPlanRecommender: React.FC<PersonalizedPlanProps> = ({
  profile,
  setProfile,
  onApplyPlanToPlanner,
  onGoToChat,
}) => {
  const currentMajor = STEM_MAJORS.find((m) => m.id === profile.majorId) || STEM_MAJORS[0];

  const [interests, setInterests] = useState<string>('');
  const [careerGoal, setCareerGoal] = useState<string>('국내외 명문 대학원 진학 (석사/석박통합)');
  const [targetGpa, setTargetGpa] = useState<number>(3.8);
  const [studyHours, setStudyHours] = useState<string>('주당 25시간 내외');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Backend Saved Plans State
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [savingToBackend, setSavingToBackend] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load saved plans from backend server on mount
  useEffect(() => {
    fetchSavedPlans().then((plans) => setSavedPlans(plans));
  }, []);

  const handleSaveToBackend = async () => {
    if (!generatedPlan) return;
    setSavingToBackend(true);
    const planTitle = `${currentMajor.name} ${profile.currentYear}학년 ${profile.currentSemester}학기 맞춤 계획 (${new Date().toLocaleDateString()})`;

    const saved = await savePlanToBackend({
      title: planTitle,
      major: currentMajor.name,
      year: profile.currentYear,
      semester: profile.currentSemester,
      careerGoal,
      planContent: generatedPlan,
    });

    if (saved) {
      setSavedPlans((prev) => [saved, ...prev]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
    setSavingToBackend(false);
  };

  const handleDeleteSavedPlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('백엔드 서버에서 이 계획을 삭제하시겠습니까?')) return;
    const ok = await deleteSavedPlan(id);
    if (ok) {
      setSavedPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Common interest tags for current major
  const commonInterestPresets: Record<MajorId, string[]> = {
    cs: ['대규모 언어모델(LLM)', '분산 시스템/클라우드', '컴퓨터 비전', '백엔드 아키텍처', '정보보안/암호학'],
    ee: ['반도체 소자물리/GAA', 'CMOS 회로설계(VLSI)', '5G/6G 무선통신', '배터리 관리시스템(BMS)', '임베디드 제어'],
    me: ['자율주행 로보틱스', '전산유체역학(CFD)', '배터리 열관리(BTM)', '유한요소해석(FEA)', '스마트 팩토리'],
    chem_mat: ['2차전지 양극재/음극재', '전고체 배터리', '반도체 박막 공정(ALD)', '수소 연료전지', '고분자 소재'],
    bio: ['AI 신약 개발', 'AlphaFold 단백질 구조', '차세대 염기서열(NGS)', 'CRISPR 유전자 가위', '면역 항암 치료'],
    math_ai: ['볼록 최적화 이론', '딥러닝 수리적 기초', '확률과정론', '퀀트 금융수학', '미분기하학'],
  };

  const handleInterestToggle = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.replace(new RegExp(`${tag},?\\s*`), '').trim());
    } else {
      setInterests(interests ? `${interests}, ${tag}` : tag);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setGeneratedPlan(null);

    try {
      const completedCourseNames = currentMajor.courses
        .filter((c) => profile.completedCourseIds.includes(c.id))
        .map((c) => c.name);

      const res = await fetch('/api/generate-personalized-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          major: currentMajor.name,
          year: profile.currentYear,
          semester: profile.currentSemester,
          interests: interests || '전반적인 전공 필수 및 심화 역량 강화',
          careerGoal,
          completedCourses: completedCourseNames,
          targetGpa,
          studyHoursPerWeek: studyHours,
        }),
      });

      if (!res.ok) {
        throw new Error('계획 생성 요청 실패');
      }

      const data = await res.json();
      setGeneratedPlan(data.plan || '계획이 생성되지 않았습니다.');
    } catch (e: unknown) {
      console.error(e);
      setGeneratedPlan('오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(generatedPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Recommended upcoming courses based on current year/semester and not yet completed
  const upcomingRecommended = currentMajor.courses.filter(
    (c) =>
      c.year === profile.currentYear &&
      c.semester === profile.currentSemester &&
      !profile.completedCourseIds.includes(c.id)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-cyan-950/30 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI 기반 맞춤 학습 설계 엔진
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              개인별 맞춤 학습 계획 & 과목 추천 로드맵
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              사용자의 현재 학년, 전공, 세부 관심사, 기이수 과목 현황 및 희망 진로를 종합 분석하여
              선수과목 꼬임 없는 최적의 수강 로드맵과 실전 학업 전략을 생성합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 shrink-0">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
            <div className="text-xs">
              <span className="text-slate-400 block font-medium">선택된 전공</span>
              <span className="text-white font-bold">{currentMajor.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Profile & Preference Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Target className="w-4 h-4 text-cyan-400" />
              학업 프로필 및 선호도 설정
            </h2>

            {/* Current Year & Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  현재 학년
                </label>
                <select
                  value={profile.currentYear}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, currentYear: Number(e.target.value) }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={1}>1학년 (신입생)</option>
                  <option value={2}>2학년</option>
                  <option value={3}>3학년</option>
                  <option value={4}>4학년 (졸업준비)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  이수 예정 학기
                </label>
                <select
                  value={profile.currentSemester}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, currentSemester: Number(e.target.value) as 1 | 2 }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={1}>1학기 (봄)</option>
                  <option value={2}>2학기 (가을)</option>
                </select>
              </div>
            </div>

            {/* Career Goal */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                희망 진로 및 목표
              </label>
              <select
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="국내외 명문 대학원 진학 (석사/석박통합/전문연구요원)">
                  국내외 명문 대학원 진학 (석사/석박통합/전문연)
                </option>
                <option value="미국/유럽 탑스쿨 유학 (박사 풀펀딩)">
                  미국/유럽 탑스쿨 유학 (박사 풀펀딩)
                </option>
                <option value="국내 대기업 R&D 및 연구원 (삼성, 현대, SK, LG 등)">
                  국내 대기업 R&D 및 엔지니어 (삼성, 현대, SK, LG 등)
                </option>
                <option value="빅테크/유니콘 스타트업 SW 개발자">
                  빅테크/유니콘 스타트업 SW 개발자 (네카라쿠배 등)
                </option>
                <option value="정부출연연구기관(KIST, ETRI, ADD 등) 연구원">
                  정부출연연구기관 (KIST, ETRI, ADD 등)
                </option>
                <option value="기술 기반 테크 스타트업 창업">
                  기술 기반 테크 스타트업 창업
                </option>
              </select>
            </div>

            {/* Interests & Keywords */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                세부 관심 분야 및 연구 키워드
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="예: 트랜스포머 아키텍처, 분산 캐시, 반도체 GAA 공정"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {(commonInterestPresets[profile.majorId] || []).map((preset) => {
                  const isSelected = interests.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleInterestToggle(preset)}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      +{preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target GPA & Study Hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  목표 학점 (GPA)
                </label>
                <select
                  value={targetGpa}
                  onChange={(e) => setTargetGpa(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={3.5}>3.5 이상 (안정권)</option>
                  <option value={3.8}>3.8 이상 (우수/대기업 우대)</option>
                  <option value={4.0}>4.0 이상 (최우등/대학원 전액장학)</option>
                  <option value={4.2}>4.2 이상 (수석/해외탑스쿨 목표)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  주당 가용 학습 시간
                </label>
                <select
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="주당 15시간 (가벼움/동아리 병행)">주당 15시간 (동아리 병행)</option>
                  <option value="주당 25시간 내외 (표준 몰입)">주당 25시간 (표준 몰입)</option>
                  <option value="주당 35시간 이상 (초고밀도 열공)">주당 35시간+ (초고밀도 열공)</option>
                </select>
              </div>
            </div>

            {/* Completed Courses Summary */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">
                  기이수 완료 과목:
                </span>
                <span className="text-cyan-400 font-mono font-bold">
                  {profile.completedCourseIds.length}과목 선택됨
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                * [전공 로드맵] 탭에서 과목 카드의 체크 아이콘을 누르면 기이수 과목으로 자동 반영됩니다.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gemini AI가 정밀 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  개인별 맞춤 학습 계획 & 로드맵 생성
                </>
              )}
            </button>
          </div>

          {/* Quick Upcoming Recommendations Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <BookmarkPlus className="w-4 h-4 text-cyan-400" />
              이번 학기({profile.currentYear}학년 {profile.currentSemester}학기) 기본 권장 과목
            </h3>
            {upcomingRecommended.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                모든 권장 과목을 이수했거나 등록된 과목이 없습니다.
              </p>
            ) : (
              <div className="space-y-1.5">
                {upcomingRecommended.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{course.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {course.credits}학점 • {course.categoryLabel}
                      </span>
                    </div>
                    <button
                      onClick={() => onApplyPlanToPlanner([course.id])}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-[11px] transition-colors"
                    >
                      플래너 담기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Backend Saved Plans Drawer */}
          {savedPlans.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                  서버 저장된 맞춤 계획 ({savedPlans.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Backend Persisted</span>
              </h3>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {savedPlans.map((sp) => (
                  <div
                    key={sp.id}
                    onClick={() => setGeneratedPlan(sp.planContent)}
                    className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between text-xs transition-all group"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-200 block truncate group-hover:text-indigo-300">
                        {sp.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(sp.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSavedPlan(sp.id, e)}
                      title="삭제"
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Generated Report / Result (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">
                  맞춤형 학업 전략 분석 리포트
                </h2>
              </div>

              {generatedPlan && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToBackend}
                    disabled={savingToBackend}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                      savedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40'
                    }`}
                  >
                    {savedSuccess ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savedSuccess ? '서버 저장 완료!' : savingToBackend ? '저장 중...' : '백엔드 서버 저장'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '복사 완료' : '보고서 복사'}
                  </button>

                  <button
                    onClick={() => onGoToChat(`방금 생성된 맞춤 학습 계획에 대해 더 구체적인 조언을 듣고 싶어. 내 프로필: ${currentMajor.name} ${profile.currentYear}학년, 관심사: ${interests}, 목표: ${careerGoal}`)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    AI 멘토에게 후속 질문
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-200">
                  학생의 전공, 이수 과목, 관심사 및 진로를 종합 분석 중입니다...
                </p>
                <p className="text-xs text-slate-500 max-w-sm">
                  선수과목 체계도와 학기별 과제 로드를 바탕으로 최적의 학습 로드맵을 구성하고 있습니다.
                </p>
              </div>
            ) : generatedPlan ? (
              <div className="prose prose-invert prose-sm max-w-none flex-1 overflow-y-auto leading-relaxed text-slate-200">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(generatedPlan),
                  }}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3 text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    아직 생성된 맞춤 계획이 없습니다.
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    왼쪽의 학업 프로필(학년, 관심사, 진로 등)을 설정한 후
                    <strong> [개인별 맞춤 학습 계획 생성] </strong> 버튼을 눌러보세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
