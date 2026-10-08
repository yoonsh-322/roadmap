import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Plus, 
  Info, 
  Sparkles, 
  Star, 
  Flame, 
  ArrowRight, 
  Filter, 
  Check, 
  AlertCircle,
  HelpCircle,
  X,
  Layers,
  ChevronRight,
  TrendingUp,
  BookmarkPlus
} from 'lucide-react';
import { Course, CourseCategory, MajorData, StudentProfile } from '../types/stem';

interface RoadmapViewerProps {
  major: MajorData;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  onAskMentorAboutCourse: (course: Course) => void;
  onGoToPlanner: () => void;
}

const CATEGORY_COLORS: Record<CourseCategory, { bg: string; text: string; border: string }> = {
  basic_science_math: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-600/40' },
  major_foundation: { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-600/40' },
  major_required: { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-600/40' },
  major_elective: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-600/40' },
  capstone_research: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-600/40' },
};

export const RoadmapViewer: React.FC<RoadmapViewerProps> = ({
  major,
  profile,
  setProfile,
  onAskMentorAboutCourse,
  onGoToPlanner,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [selectedTrack, setSelectedTrack] = useState<string | 'all'>('all');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);

  // Semesters list
  const semesters = [
    { year: 1, semester: 1, label: '1학년 1학기' },
    { year: 1, semester: 2, label: '1학년 2학기' },
    { year: 2, semester: 1, label: '2학년 1학기' },
    { year: 2, semester: 2, label: '2학년 2학기' },
    { year: 3, semester: 1, label: '3학년 1학기' },
    { year: 3, semester: 2, label: '3학년 2학기' },
    { year: 4, semester: 1, label: '4학년 1학기' },
    { year: 4, semester: 2, label: '4학년 2학기' },
  ];

  const toggleCompleted = (courseId: string) => {
    setProfile((prev) => {
      const exists = prev.completedCourseIds.includes(courseId);
      const updated = exists
        ? prev.completedCourseIds.filter((id) => id !== courseId)
        : [...prev.completedCourseIds, courseId];
      return { ...prev, completedCourseIds: updated };
    });
  };

  const togglePlanned = (courseId: string) => {
    setProfile((prev) => {
      const exists = prev.plannedCourseIds.includes(courseId);
      const updated = exists
        ? prev.plannedCourseIds.filter((id) => id !== courseId)
        : [...prev.plannedCourseIds, courseId];
      return { ...prev, plannedCourseIds: updated };
    });
  };

  // Find prerequisite courses and dependent courses for highlight
  const targetId = hoveredCourseId || activeCourse?.id;
  const targetCourse = major.courses.find((c) => c.id === targetId);

  const prerequisiteIds = targetCourse ? targetCourse.prerequisites : [];
  const dependentIds = targetCourse
    ? major.courses.filter((c) => c.prerequisites.includes(targetCourse.id)).map((c) => c.id)
    : [];

  // Filter courses
  const filteredCourses = major.courses.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedTrack !== 'all') {
      const trackObj = major.tracks.find((t) => t.id === selectedTrack);
      if (trackObj && !trackObj.coreCourses.includes(c.id)) return false;
    }
    return true;
  });

  // Calculate progress stats
  const totalCompletedCredits = major.courses
    .filter((c) => profile.completedCourseIds.includes(c.id))
    .reduce((sum, c) => sum + c.credits, 0);

  const requiredMajorCredits = major.courses
    .filter((c) => c.category === 'major_required' && profile.completedCourseIds.includes(c.id))
    .reduce((sum, c) => sum + c.credits, 0);

  const totalMajorRequiredGoal = major.courses
    .filter((c) => c.category === 'major_required')
    .reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${major.badgeColor}`}>
                {major.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {major.englishName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              이공계 전공 이수 로드맵 & 선수과목 체계도
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {major.description}
            </p>
          </div>

          {/* Progress Card */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-inner shrink-0">
            <div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>전공 이수 학점</span>
                <span className="text-cyan-400 font-bold ml-2">
                  {totalCompletedCredits} / {major.graduationRequirement.totalCredits} 학점
                </span>
              </div>
              <div className="w-40 sm:w-48 bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (totalCompletedCredits / major.graduationRequirement.totalCredits) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>전필: {requiredMajorCredits}/{totalMajorRequiredGoal}학점</span>
                <span>이수율 {Math.round((totalCompletedCredits / major.graduationRequirement.totalCredits) * 100)}%</span>
              </div>
            </div>

            <button
              onClick={onGoToPlanner}
              className="px-3 py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center gap-1 transition-all"
            >
              플래너
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Career Sub-tracks Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            전공 세부 트랙:
          </span>
          <button
            onClick={() => setSelectedTrack('all')}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              selectedTrack === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            전체 과목 보기
          </button>
          {major.tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
                selectedTrack === track.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <span>{track.name}</span>
              <span className="text-[10px] opacity-75">({track.coreCourses.length}과목)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> 구분:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-0.5 rounded text-[11px] ${
              selectedCategory === 'all' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setSelectedCategory('major_required')}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
              selectedCategory === 'major_required' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 전공필수
          </button>
          <button
            onClick={() => setSelectedCategory('major_elective')}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
              selectedCategory === 'major_elective' ? 'bg-purple-500 text-white font-bold' : 'text-purple-400 hover:bg-purple-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> 전공선택
          </button>
          <button
            onClick={() => setSelectedCategory('major_foundation')}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
              selectedCategory === 'major_foundation' ? 'bg-blue-500 text-white font-bold' : 'text-blue-400 hover:bg-blue-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 전공기초
          </button>
          <button
            onClick={() => setSelectedCategory('basic_science_math')}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
              selectedCategory === 'basic_science_math' ? 'bg-emerald-500 text-white font-bold' : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 기초과학/수학
          </button>
          <button
            onClick={() => setSelectedCategory('capstone_research')}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
              selectedCategory === 'capstone_research' ? 'bg-amber-500 text-white font-bold' : 'text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 캡스톤/연구
          </button>
        </div>

        {/* Hover Hint */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80 border border-amber-400" />
            <span>선수과목</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/80 border border-cyan-400" />
            <span>후수과목</span>
          </div>
          <span className="text-slate-500 hidden md:inline">| 마우스 오버 시 연계 과목 하이라이트</span>
        </div>
      </div>

      {/* Semester Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {semesters.map((sem) => {
          const semCourses = filteredCourses.filter(
            (c) => c.year === sem.year && c.semester === sem.semester
          );

          const isCurrentSemester =
            profile.currentYear === sem.year && profile.currentSemester === sem.semester;

          return (
            <div
              key={`${sem.year}-${sem.semester}`}
              className={`rounded-xl border transition-all ${
                isCurrentSemester
                  ? 'bg-slate-900/90 border-cyan-500/70 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800/80'
              } p-3.5 flex flex-col`}
            >
              {/* Semester Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-200">
                    {sem.label}
                  </span>
                  {isCurrentSemester && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      현재 학기
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {semCourses.reduce((sum, c) => sum + c.credits, 0)} 학점
                </span>
              </div>

              {/* Course Cards inside this Semester */}
              <div className="space-y-2.5 flex-1">
                {semCourses.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-xs text-slate-500 italic border border-dashed border-slate-800/80 rounded-lg">
                    해당 조건의 과목 없음
                  </div>
                ) : (
                  semCourses.map((course) => {
                    const isCompleted = profile.completedCourseIds.includes(course.id);
                    const isPlanned = profile.plannedCourseIds.includes(course.id);
                    const isPrereq = prerequisiteIds.includes(course.id);
                    const isDep = dependentIds.includes(course.id);
                    const isSelf = targetId === course.id;

                    const catStyle = CATEGORY_COLORS[course.category];

                    return (
                      <div
                        key={course.id}
                        onMouseEnter={() => setHoveredCourseId(course.id)}
                        onMouseLeave={() => setHoveredCourseId(null)}
                        className={`group relative rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                          isSelf
                            ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-950'
                            : isPrereq
                            ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50 shadow-md shadow-amber-950 animate-pulse'
                            : isDep
                            ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/50 shadow-md shadow-cyan-950'
                            : isCompleted
                            ? 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600'
                            : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                        }`}
                        onClick={() => setActiveCourse(course)}
                      >
                        {/* Status Tags */}
                        {isPrereq && (
                          <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 shadow">
                            선수과목 ⬆
                          </div>
                        )}
                        {isDep && (
                          <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-400 text-slate-950 shadow">
                            후수과목 ⬇
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {course.categoryLabel}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-slate-300">
                            {course.credits}학점
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-xs sm:text-[13px] text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                          {course.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                          {course.englishName}
                        </p>

                        {/* Bottom Info: Difficulty & Workload */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">난이도:</span>
                            <div className="flex">
                              {[...Array(course.difficulty)].map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          </div>

                          {/* Quick Toggles */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleCompleted(course.id)}
                              title={isCompleted ? '이수 완료 취소' : '이수 완료로 표시'}
                              className={`p-1 rounded-md transition-colors ${
                                isCompleted
                                  ? 'text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => togglePlanned(course.id)}
                              title={isPlanned ? '플래너에서 제거' : '플래너에 추가'}
                              className={`p-1 rounded-md transition-colors ${
                                isPlanned
                                  ? 'text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/80'
                                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                              }`}
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Detail Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-850 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                      CATEGORY_COLORS[activeCourse.category].bg
                    } ${CATEGORY_COLORS[activeCourse.category].text} ${
                      CATEGORY_COLORS[activeCourse.category].border
                    }`}
                  >
                    {activeCourse.categoryLabel}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeCourse.year}학년 {activeCourse.semester}학기 권장 • {activeCourse.credits}학점
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {activeCourse.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {activeCourse.englishName}
                </p>
              </div>

              <button
                onClick={() => setActiveCourse(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-sm">
              {/* Difficulty & Workload Metrics */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">체감 개념 난이도</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= activeCourse.difficulty
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {activeCourse.difficulty} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">학습량 & 과제 로드</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`w-3.5 h-3.5 rounded-sm ${
                            lvl <= activeCourse.workload ? 'bg-cyan-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {activeCourse.workload} / 5
                    </span>
                  </div>
                </div>
              </div>

              {/* Prerequisites Chain */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  선수 과목 (Prerequisites)
                </h4>
                {activeCourse.prerequisites.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                    선수과목 없이 단독으로 수강 가능한 기초 과목입니다.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeCourse.prerequisites.map((prereqId) => {
                      const prereqCourse = major.courses.find((c) => c.id === prereqId);
                      const isCompleted = profile.completedCourseIds.includes(prereqId);
                      return (
                        <div
                          key={prereqId}
                          onClick={() => {
                            if (prereqCourse) setActiveCourse(prereqCourse);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isCompleted
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
                              : 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/40'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className="font-medium">
                            {prereqCourse?.name || prereqId}
                          </span>
                          <span className="text-[10px] opacity-75">
                            ({isCompleted ? '이수완료' : '미이수'})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Core Topics */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  핵심 학습 주제
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeCourse.coreTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Senior Practical Advice */}
              <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-800/60 rounded-xl p-3.5">
                <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  선배의 실전 학업 & 시험 꿀팁
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeCourse.tips}
                </p>
              </div>

              {/* Recommended Books / Resources */}
              {activeCourse.recommendedBooks.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    추천 교재 및 레퍼런스
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {activeCourse.recommendedBooks.map((book, i) => (
                      <li key={i}>{book}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCompleted(activeCourse.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    profile.completedCourseIds.includes(activeCourse.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {profile.completedCourseIds.includes(activeCourse.id) ? '이수 완료됨' : '이수 완료 체크'}
                </button>

                <button
                  onClick={() => togglePlanned(activeCourse.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    profile.plannedCourseIds.includes(activeCourse.id)
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  {profile.plannedCourseIds.includes(activeCourse.id) ? '플래너 담김' : '학기 플래너에 담기'}
                </button>
              </div>

              <button
                onClick={() => {
                  onAskMentorAboutCourse(activeCourse);
                  setActiveCourse(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-900/40 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                AI 멘토에게 이 과목 질문하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
