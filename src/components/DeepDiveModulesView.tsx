import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  Cog, 
  FlaskConical, 
  Dna, 
  Infinity as MathIcon, 
  BookOpen, 
  ExternalLink, 
  Code, 
  Sparkles, 
  FolderGit2, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  FileText,
  GraduationCap
} from 'lucide-react';
import { DEEP_DIVE_MODULES, DeepDiveModule } from '../data/deepDiveModules';
import { STEM_MAJORS } from '../data/stemMajors';
import { MajorId } from '../types/stem';

interface DeepDiveModulesViewProps {
  currentMajorId: MajorId;
  onGoToChat: (prompt: string) => void;
}

export const DeepDiveModulesView: React.FC<DeepDiveModulesViewProps> = ({
  currentMajorId,
  onGoToChat,
}) => {
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<MajorId | 'all'>(currentMajorId);
  const [activeModule, setActiveModule] = useState<DeepDiveModule>(
    DEEP_DIVE_MODULES.find((m) => m.majorId === currentMajorId) || DEEP_DIVE_MODULES[0]
  );

  const filteredModules = selectedMajorFilter === 'all'
    ? DEEP_DIVE_MODULES
    : DEEP_DIVE_MODULES.filter((m) => m.majorId === selectedMajorFilter);

  const majorIconMap: Record<MajorId, React.ComponentType<{ className?: string }>> = {
    cs: Cpu,
    ee: Zap,
    me: Cog,
    chem_mat: FlaskConical,
    bio: Dna,
    math_ai: MathIcon,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Engineering Deep Dive Modules
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              공학 분야별 심화 학습 & 실전 프로젝트 모듈
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              학부 기초 과목을 넘어선 최신 산업/연구 핵심 이론, 수식 원리, 필독 논문/명저 및 
              대학원 랩실 지원과 테크 면접을 위한 포트폴리오 프로젝트 아이디어를 탐구하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setSelectedMajorFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedMajorFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              전체
            </button>
            {STEM_MAJORS.map((m) => {
              const Icon = majorIconMap[m.id];
              const isSelected = selectedMajorFilter === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMajorFilter(m.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.name.split('/')[0].split('학')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module Selector Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            심화 학습 모듈 목록 ({filteredModules.length})
          </h2>

          <div className="space-y-2.5">
            {filteredModules.map((module) => {
              const isSelected = activeModule.id === module.id;
              const Icon = majorIconMap[module.majorId];
              return (
                <div
                  key={module.id}
                  onClick={() => setActiveModule(module)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 ring-1 ring-cyan-400/40 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                        {module.difficulty}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {module.majorId.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-cyan-300 leading-snug">
                    {module.title}
                  </h3>

                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {module.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Content Detail (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    난이도: {activeModule.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeModule.englishTitle}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeModule.title}
                </h2>
              </div>

              <button
                onClick={() =>
                  onGoToChat(
                    `심화 학습 모듈 '${activeModule.title}'에 대해 질문하고 싶어. 특히 '${activeModule.keyConcepts[0]?.name}' 개념과 추천 프로젝트 구현 방향을 더 자세히 설명해 줘!`
                  )
                }
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-950 shrink-0 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                이 주제 AI 멘토에게 심화 질문
              </button>
            </div>

            {/* Summary */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {activeModule.summary}
            </p>

            {/* 1. Key Concepts */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-cyan-400" />
                1. 주요 핵심 이론 및 원리 (Key Concepts)
              </h3>
              <div className="space-y-3">
                {activeModule.keyConcepts.map((kc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="font-bold text-cyan-300 text-xs sm:text-sm">
                      {kc.name}
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {kc.description}
                    </p>
                    {kc.coreFormulasOrPrinciples && (
                      <div className="bg-slate-900 border border-slate-750 p-2 rounded font-mono text-[11px] text-cyan-200 space-y-1">
                        {kc.coreFormulasOrPrinciples.map((f, i) => (
                          <div key={i}>📐 {f}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Related Courses */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                2. 연계 및 필수 이수 과목 (Related Courses)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeModule.relatedCourses.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <span className="text-[10px] text-cyan-400 font-bold block mb-0.5">
                      {c.role}
                    </span>
                    <span className="font-semibold text-slate-200 block">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {c.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Recommended Resources */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                3. 추천 학습 자료 (명저 교재, 논문 & 오픈 강의)
              </h3>
              <div className="space-y-2">
                {activeModule.recommendedResources.map((res, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {res.category}
                        </span>
                        <span className="text-[11px] font-bold text-white">
                          {res.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {res.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono shrink-0">
                      {res.authorOrSource}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Practical Hands-on Project Ideas */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                4. 실전 포트폴리오 프로젝트 아이디어 (Hands-on Projects)
              </h3>
              <div className="space-y-3">
                {activeModule.projectIdeas.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-950 to-indigo-950/30 border border-indigo-900/40 text-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          목표 직무: {proj.targetRole}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">
                          {proj.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        난이도: {proj.difficulty}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                      {proj.overview}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">
                        기술 스택:
                      </span>
                      {proj.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-750 font-mono text-[10px]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Milestones */}
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
                        구현 4단계 마일스톤:
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                        {proj.milestones.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="text-[11px] text-cyan-400 font-medium">
                      🎯 최종 산출물: {proj.expectedOutcome}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
