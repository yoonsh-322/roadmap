import React, { useState, useEffect } from 'react';
import { Header, NavigationTab } from './components/Header';
import { RoadmapViewer } from './components/RoadmapViewer';
import { PersonalizedPlanRecommender } from './components/PersonalizedPlanRecommender';
import { SeniorMentoringQA } from './components/SeniorMentoringQA';
import { DeepDiveModulesView } from './components/DeepDiveModulesView';
import { SemesterPlanner } from './components/SemesterPlanner';
import { GeminiMentorChat } from './components/GeminiMentorChat';
import { CareerGuide } from './components/CareerGuide';
import { LabEmailGenerator } from './components/LabEmailGenerator';
import { STEM_MAJORS } from './data/stemMajors';
import { Course, StudentProfile, MajorId } from './types/stem';
import { Compass, Sparkles, BookOpen, Heart, Cpu, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchBackendStorage, saveProfileToBackend } from './utils/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('roadmap');
  const [profile, setProfile] = useState<StudentProfile>({
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
  });

  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [isServerSynced, setIsServerSynced] = useState<boolean>(true);

  // Load initial state from backend storage on mount
  useEffect(() => {
    fetchBackendStorage().then((state) => {
      if (state && state.profile) {
        setProfile({
          ...state.profile,
          majorId: (state.profile.majorId || 'cs') as MajorId,
        });
        setIsServerSynced(true);
      }
    });
  }, []);

  // Update profile with automatic backend storage persistence
  const handleUpdateProfile: React.Dispatch<React.SetStateAction<StudentProfile>> = (action) => {
    setProfile((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      // Persist to backend server asynchronously
      saveProfileToBackend(next).then((ok) => {
        setIsServerSynced(ok);
      });
      return next;
    });
  };

  const currentMajor =
    STEM_MAJORS.find((m) => m.id === profile.majorId) || STEM_MAJORS[0];

  const handleAskMentorAboutCourse = (course: Course) => {
    setChatInitialPrompt(
      `'${course.name} (${course.englishName})' 과목에 대해 질문하고 싶어!\n- 학점: ${course.credits}학점 (${course.categoryLabel})\n- 권장 학기: ${course.year}학년 ${course.semester}학기\n- 핵심 주제: ${course.coreTopics.join(', ')}\n\n이 과목을 수강할 때 선배들이 겪는 주된 난관과, A+를 받기 위한 구체적인 공부 루틴/참고 자료를 알려줘!`
    );
    setCurrentTab('chat');
  };

  const handleGoToChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setCurrentTab('chat');
  };

  const handleApplyPlanToPlanner = (courseIds: string[]) => {
    setProfile((prev) => {
      const combined = Array.from(new Set([...prev.plannedCourseIds, ...courseIds]));
      return { ...prev, plannedCourseIds: combined };
    });

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // fallback safe
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Pretendard',sans-serif]">
      {/* Top Fixed Header with Dropdown & Navigation Tabs */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        profile={profile}
        setProfile={handleUpdateProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'roadmap' && (
          <RoadmapViewer
            major={currentMajor}
            profile={profile}
            setProfile={handleUpdateProfile}
            onAskMentorAboutCourse={handleAskMentorAboutCourse}
            onGoToPlanner={() => setCurrentTab('planner')}
          />
        )}

        {currentTab === 'personalized' && (
          <PersonalizedPlanRecommender
            profile={profile}
            setProfile={handleUpdateProfile}
            onApplyPlanToPlanner={handleApplyPlanToPlanner}
            onGoToChat={handleGoToChatWithPrompt}
          />
        )}

        {currentTab === 'mentoring' && (
          <SeniorMentoringQA
            profile={profile}
            onGoToChat={handleGoToChatWithPrompt}
          />
        )}

        {currentTab === 'deepdive' && (
          <DeepDiveModulesView
            currentMajorId={profile.majorId}
            onGoToChat={handleGoToChatWithPrompt}
          />
        )}

        {currentTab === 'planner' && (
          <SemesterPlanner
            major={currentMajor}
            profile={profile}
            setProfile={handleUpdateProfile}
            onGoToRoadmap={() => setCurrentTab('roadmap')}
            onGoToChat={handleGoToChatWithPrompt}
          />
        )}

        {currentTab === 'chat' && (
          <GeminiMentorChat
            profile={profile}
            initialPrompt={chatInitialPrompt}
            onClearInitialPrompt={() => setChatInitialPrompt('')}
          />
        )}

        {currentTab === 'career' && (
          <CareerGuide
            profile={profile}
            onGoToChat={handleGoToChatWithPrompt}
          />
        )}

        {currentTab === 'email' && (
          <LabEmailGenerator profile={profile} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-cyan-600/30 flex items-center justify-center text-cyan-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-400 font-['JetBrains_Mono']">
              STEM COMPASS & AI MENTOR
            </span>
            <span className="text-slate-600">|</span>
            <span>이공계 학부생 전용 커리큘럼 & Gemini 다회차 상담</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            {/* Backend Sync Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300 font-medium">백엔드 서버 데이터 영구 저장</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-cyan-400 font-mono font-medium hidden md:inline">Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
