import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  RefreshCw,
  Info
} from 'lucide-react';
import { StudentProfile } from '../types/stem';
import { renderMarkdown } from '../utils/markdown';

interface LabEmailGeneratorProps {
  profile: StudentProfile;
}

export const LabEmailGenerator: React.FC<LabEmailGeneratorProps> = ({ profile }) => {
  const [professorName, setProfessorName] = useState('');
  const [labTopic, setLabTopic] = useState('');
  const [studentBackground, setStudentBackground] = useState('');
  const [purpose, setPurpose] = useState('학부 연구생 (Lab Intern) 지원 및 연구 참여');
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorName.trim() || !labTopic.trim()) return;

    setLoading(true);
    setGeneratedDraft(null);

    try {
      const res = await fetch('/api/generate-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorName,
          labTopic,
          studentMajor: profile.majorId.toUpperCase(),
          studentYear: profile.currentYear,
          studentBackground:
            studentBackground ||
            `전공 기초 및 필수 과목 이수 완료 (총 ${profile.completedCourseIds.length}과목), 평점 ${profile.currentGpa || 3.8}`,
          purpose,
        }),
      });

      const data = await res.json();
      setGeneratedDraft(data.draft || '메일 초안 생성에 실패했습니다.');
    } catch (err) {
      console.error(err);
      setGeneratedDraft('초안 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              학부연구생 컨택 이메일 생성기
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              교수님 연구실 컨택 & 면담 요청 이메일 작성 AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              교수님의 마음을 여는 정중한 예절, 연구 주제에 대한 진정성 있는 관심, 그리고 
              자신의 역량을 깔끔하게 정리한 최적의 학부연구생 지원 메일 초안을 생성합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleGenerate}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-xs"
          >
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <FileText className="w-4 h-4 text-cyan-400" />
              컨택 정보 입력
            </h2>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                교수님 성함
              </label>
              <input
                type="text"
                required
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                연구실 핵심 연구 분야 / 최근 논문 키워드
              </label>
              <input
                type="text"
                required
                value={labTopic}
                onChange={(e) => setLabTopic(e.target.value)}
                placeholder="예: 고효율 차세대 NCM 양극재 합성 및 배터리 열화 메커니즘"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                본인의 이수 과목, 다뤄본 툴/언어 및 성적
              </label>
              <textarea
                rows={3}
                value={studentBackground}
                onChange={(e) => setStudentBackground(e.target.value)}
                placeholder="예: 물리화학, 전달현상 A+ 수강 완료 / Python 및 OriginPro 데이터 분석 가능 / 학점 4.1"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                컨택 목적
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="학부 연구생 (Lab Intern) 지원 및 연구 참여">
                  학부 연구생 (Lab Intern) 지원 및 연구 참여
                </option>
                <option value="석사 / 석박통합 대학원 진학 사전 면담">
                  석사 / 석박통합 대학원 진학 사전 면담
                </option>
                <option value="졸업 캡스톤 디자인 프로젝트 지도 교수 면담 요청">
                  졸업 캡스톤 디자인 프로젝트 지도 요청
                </option>
                <option value="해외 유학 추천서(Reference Letter) 부탁 면담">
                  해외 유학 추천서 부탁 면담
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-950 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  교수님 맞춤 메일 초안 작성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  전문가 감수 이메일 전문 생성
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg min-h-[460px] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-400" />
                이메일 초안 미리보기
              </h2>

              {generatedDraft && (
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '복사 완료' : '전체 복사'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-rose-500/20 border-t-rose-400 animate-spin" />
                <p className="text-xs font-semibold text-slate-300">
                  교수님의 시각에서 가장 매력적이고 정중한 이메일을 구성 중입니다...
                </p>
              </div>
            ) : generatedDraft ? (
              <div className="prose prose-invert prose-xs max-w-none flex-1 overflow-y-auto leading-relaxed text-slate-200">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(generatedDraft),
                  }}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-2 text-slate-500">
                <Mail className="w-8 h-8 text-slate-600" />
                <p className="text-xs text-slate-400">
                  왼쪽 폼에 교수님 성함과 연구실 키워드를 입력하고 생성 버튼을 누르세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
