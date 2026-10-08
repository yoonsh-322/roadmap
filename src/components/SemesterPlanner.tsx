import React, { useState } from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Calculator, 
  Plus, 
  RefreshCw,
  Copy,
  Check,
  Flame,
  Clock
} from 'lucide-react';
import { Course, MajorData, StudentProfile } from '../types/stem';
import { renderMarkdown } from '../utils/markdown';

interface SemesterPlannerProps {
  major: MajorData;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  onGoToRoadmap: () => void;
  onGoToChat: (msg: string) => void;
}

export const SemesterPlanner: React.FC<SemesterPlannerProps> = ({
  major,
  profile,
  setProfile,
  onGoToRoadmap,
  onGoToChat,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // GPA Simulator State
  const [currentGpaInput, setCurrentGpaInput] = useState<number>(profile.currentGpa || 3.6);
  const [targetGpaInput, setTargetGpaInput] = useState<number>(profile.targetGpa || 4.0);
  const [completedCreditsInput, setCompletedCreditsInput] = useState<number>(
    profile.completedCourseIds.length * 3 || 36
  );
  const [totalGraduationCredits, setTotalGraduationCredits] = useState<number>(
    major.graduationRequirement.totalCredits
  );

  // Planned courses objects
  const plannedCourses = major.courses.filter((c) =>
    profile.plannedCourseIds.includes(c.id)
  );

  const totalPlannedCredits = plannedCourses.reduce((sum, c) => sum + c.credits, 0);

  // Prerequisite Checker
  const missingPrerequisitesMap: Record<string, string[]> = {};
  plannedCourses.forEach((c) => {
    const missing: string[] = [];
    c.prerequisites.forEach((pId) => {
      if (!profile.completedCourseIds.includes(pId)) {
        const prereqCourse = major.courses.find((x) => x.id === pId);
        missing.push(prereqCourse?.name || pId);
      }
    });
    if (missing.length > 0) {
      missingPrerequisitesMap[c.id] = missing;
    }
  });

  const hasPrereqWarning = Object.keys(missingPrerequisitesMap).length > 0;

  const removePlannedCourse = (courseId: string) => {
    setProfile((prev) => ({
      ...prev,
      plannedCourseIds: prev.plannedCourseIds.filter((id) => id !== courseId),
    }));
  };

  const clearAllPlanned = () => {
    setProfile((prev) => ({ ...prev, plannedCourseIds: [] }));
    setAnalysisResult(null);
  };

  const handleAnalyzePlan = async () => {
    if (plannedCourses.length === 0) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          major: major.name,
          year: profile.currentYear,
          semester: profile.currentSemester,
          selectedCourses: plannedCourses.map((c) => ({
            name: c.name,
            credits: c.credits,
            category: c.categoryLabel,
          })),
          careerGoal: profile.careerGoal || '대학원 진학 또는 테크 기업 취업',
        }),
      });

      const data = await res.json();
      setAnalysisResult(data.analysis || '분석 결과를 불러오지 못했습니다.');
    } catch (e) {
      console.error(e);
      setAnalysisResult('분석 요청 중 오류가 발생했습니다.');
    } finally {
      setAnalyzing(false);
    }
  };

  // GPA calculation logic
  const remainingCredits = Math.max(0, totalGraduationCredits - completedCreditsInput);
  const requiredRemainingGpa =
    remainingCredits > 0
      ? (targetGpaInput * totalGraduationCredits - currentGpaInput * completedCreditsInput) /
        remainingCredits
      : currentGpaInput;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              수강 계획 & 학점 시뮬레이터
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              이번 학기 수강 계획 & 선수과목 정밀 진단
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              수강 신청할 과목들의 선수과목 충족 여부를 실시간 검증하고, 학점 로드(Workload) 및 
              목표 졸업 평점(GPA) 달성을 위한 시뮬레이션을 제공합니다.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 shrink-0">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">플래너에 담긴 총 학점</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-extrabold ${totalPlannedCredits > 21 ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {totalPlannedCredits}
                </span>
                <span className="text-xs text-slate-400">/ 18~21 권장 학점</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Planned Courses & Prerequisite Validator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">
                  이번 학기 수강 계획 ({profile.currentYear}학년 {profile.currentSemester}학기)
                </h2>
              </div>

              {plannedCourses.length > 0 && (
                <button
                  onClick={clearAllPlanned}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  비우기
                </button>
              )}
            </div>

            {/* Prerequisite Alert Banner */}
            {hasPrereqWarning && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-3 text-xs text-amber-200 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">선수과목 미이수 경고</span>
                  <span className="text-amber-300 text-[11px] leading-relaxed">
                    담긴 과목 중 아직 이수하지 않은 선수과목이 존재합니다. 수강 전 기초 개념 숙지가 필요합니다.
                  </span>
                </div>
              </div>
            )}

            {/* Courses List */}
            {plannedCourses.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  아직 플래너에 담긴 과목이 없습니다.
                </p>
                <button
                  onClick={onGoToRoadmap}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  [전공 로드맵]에서 과목 담기
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {plannedCourses.map((course) => {
                  const missingPrereqs = missingPrerequisitesMap[course.id];
                  return (
                    <div
                      key={course.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {course.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono">
                            {course.credits}학점
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {course.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {course.englishName}
                        </p>

                        {/* Prerequisite status tag */}
                        {missingPrereqs ? (
                          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium pt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>선수과목 미이수: {missingPrereqs.join(', ')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium pt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>선수과목 충족 완료</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removePlannedCourse(course.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="제거"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* AI Review Action */}
                <button
                  onClick={handleAnalyzePlan}
                  disabled={analyzing}
                  className="w-full mt-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 disabled:opacity-60 transition-all"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Gemini AI 수강 계획 정밀 진단 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gemini AI 수강 계획 정밀 진단 리포트 받기
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* AI Analysis Report Card */}
          {analysisResult && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Gemini 수강 계획 진단 결과
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(analysisResult);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '복사됨' : '복사'}
                </button>
              </div>

              <div className="prose prose-invert prose-xs max-w-none text-xs text-slate-200 leading-relaxed overflow-y-auto max-h-96">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(analysisResult),
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: GPA Simulator & Degree Goal Calculator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Calculator className="w-4 h-4 text-cyan-400" />
              목표 평점(GPA) 달성 시뮬레이터
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  현재 누적 학점 (GPA, 4.3 or 4.5 만점)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.5"
                  value={currentGpaInput}
                  onChange={(e) => setCurrentGpaInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  기이수 완료 학점 수
                </label>
                <input
                  type="number"
                  min="0"
                  max="160"
                  value={completedCreditsInput}
                  onChange={(e) => setCompletedCreditsInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  희망 최종 졸업 목표 학점
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.5"
                  value={targetGpaInput}
                  onChange={(e) => setTargetGpaInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  졸업 기준 총 학점
                </label>
                <input
                  type="number"
                  value={totalGraduationCredits}
                  onChange={(e) => setTotalGraduationCredits(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Output Calculation Result */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>남은 이수 학점:</span>
                <span className="font-mono font-bold text-white">{remainingCredits} 학점</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-300">
                  남은 학기 평균 필요 평점:
                </span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    requiredRemainingGpa > 4.3
                      ? 'text-rose-400'
                      : requiredRemainingGpa > 3.8
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {requiredRemainingGpa > 4.5 ? '달성 불가능' : requiredRemainingGpa.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight pt-1">
                {requiredRemainingGpa > 4.3
                  ? '⚠️ 목표 평점이 다소 높습니다. 계절학기 재수강을 통한 평점 메이크업을 검토하세요.'
                  : requiredRemainingGpa > 3.8
                  ? '💡 남은 학기 과목별 A0~A+ 관리가 요구되는 집중 목표입니다.'
                  : '✅ 현재 성실히 이수해 나가면 충분히 안정적으로 달성 가능한 목표입니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
