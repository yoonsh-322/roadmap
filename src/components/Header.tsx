import React from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Bot, 
  Sparkles, 
  GraduationCap, 
  Mail, 
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Layers
} from 'lucide-react';
import { STEM_MAJORS } from '../data/stemMajors';
import { MajorId, StudentProfile } from '../types/stem';

export type NavigationTab = 
  | 'roadmap' 
  | 'personalized'
  | 'mentoring'
  | 'deepdive'
  | 'planner' 
  | 'chat' 
  | 'career' 
  | 'email';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface HeaderProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  profile,
  setProfile,
}) => {
  const currentMajor = STEM_MAJORS.find((m) => m.id === profile.majorId) || STEM_MAJORS[0];

  const handleMajorChange = (newMajorId: MajorId) => {
    setProfile((prev) => ({
      ...prev,
      majorId: newMajorId,
    }));
  };

  const navItems: NavItem[] = [
    { id: 'roadmap', label: '전공 로드맵', icon: MapPin },
    { id: 'personalized', label: '맞춤 학습 추천', icon: Sparkles, badge: 'AI' },
    { id: 'mentoring', label: '선배 멘토링 & Q&A', icon: BookOpen, badge: 'NEW' },
    { id: 'deepdive', label: '분야별 심화 학습', icon: Layers },
    { id: 'planner', label: '학기 플래너 & GPA', icon: Calendar },
    { id: 'chat', label: 'AI 학업 멘토', icon: Bot, badge: 'Gemini' },
    { id: 'career', label: '진로 & 연구실', icon: GraduationCap },
    { id: 'email', label: '컨택 메일 AI', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10">
              <Compass className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 font-['JetBrains_Mono']">
                  STEM <span className="text-cyan-400">COMPASS</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                이공계 학부생 전용 전공 로드맵 & Gemini AI 멘토
              </p>
            </div>
          </div>

          {/* Major Selector Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl px-3 py-1.5 transition-colors cursor-pointer shadow-inner">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs text-slate-400 font-medium">전공:</span>
                <select
                  value={profile.majorId}
                  onChange={(e) => handleMajorChange(e.target.value as MajorId)}
                  className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer pr-4"
                >
                  {STEM_MAJORS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100 py-1">
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 -ml-3 pointer-events-none" />
              </div>
            </div>

            {/* Academic Year Quick Selector */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-300">
              <span className="text-slate-500 px-1">학년/학기:</span>
              <select
                value={`${profile.currentYear}-${profile.currentSemester}`}
                onChange={(e) => {
                  const [y, s] = e.target.value.split('-').map(Number);
                  setProfile((prev) => ({ ...prev, currentYear: y, currentSemester: s as 1 | 2 }));
                }}
                className="bg-transparent text-xs font-medium text-cyan-300 focus:outline-none cursor-pointer"
              >
                <option value="1-1" className="bg-slate-900">1학년 1학기</option>
                <option value="1-2" className="bg-slate-900">1학년 2학기</option>
                <option value="2-1" className="bg-slate-900">2학년 1학기</option>
                <option value="2-2" className="bg-slate-900">2학년 2학기</option>
                <option value="3-1" className="bg-slate-900">3학년 1학기</option>
                <option value="3-2" className="bg-slate-900">3학년 2학기</option>
                <option value="4-1" className="bg-slate-900">4학년 1학기</option>
                <option value="4-2" className="bg-slate-900">4학년 2학기</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/60 pt-1.5">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cyan-500/30 text-cyan-300 border border-cyan-500/40">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
