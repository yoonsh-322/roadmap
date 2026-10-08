import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  CheckCircle2, 
  Search, 
  Plus, 
  X, 
  Clock, 
  Tag, 
  ChevronRight,
  UserCheck,
  Award,
  RefreshCw
} from 'lucide-react';
import { 
  SENIOR_MENTORS, 
  SENIOR_ARTICLES, 
  INITIAL_QA_POSTS, 
  SeniorMentor, 
  SeniorArticle, 
  QAPost 
} from '../data/mentorsData';
import { StudentProfile } from '../types/stem';
import { renderMarkdown } from '../utils/markdown';
import { fetchQAPosts, createQAPost, upvoteQAPost } from '../utils/api';

interface SeniorMentoringQAProps {
  profile: StudentProfile;
  onGoToChat: (initialMsg: string) => void;
}

export const SeniorMentoringQA: React.FC<SeniorMentoringQAProps> = ({
  profile,
  onGoToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'qa' | 'mentors' | 'articles'>('qa');
  const [qaPosts, setQaPosts] = useState<QAPost[]>(INITIAL_QA_POSTS);
  const [selectedMentor, setSelectedMentor] = useState<SeniorMentor | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<SeniorArticle | null>(null);

  // Load backend QA posts on mount
  useEffect(() => {
    fetchQAPosts().then((posts) => {
      if (posts && posts.length > 0) {
        setQaPosts(posts);
      }
    });
  }, []);

  // New Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionTags, setQuestionTags] = useState('');
  const [targetMentorId, setTargetMentorId] = useState<string>('mentor-1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPosts = qaPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const handleUpvote = async (postId: string) => {
    setQaPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
    await upvoteQAPost(postId);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !questionContent.trim()) return;

    setIsSubmitting(true);
    const chosenMentor = SENIOR_MENTORS.find((m) => m.id === targetMentorId) || SENIOR_MENTORS[0];

    try {
      // Request AI response on behalf of the selected Senior Mentor
      const res = await fetch('/api/mentor-qa-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorRole: `${chosenMentor.name} (${chosenMentor.affiliation})`,
          questionTitle,
          questionContent,
          studentMajor: profile.majorId,
          studentYear: profile.currentYear,
        }),
      });

      const data = await res.json();
      const answerContent = data.answer || '선배가 곧 정성스러운 답변을 남겨드릴 예정입니다.';

      const newPostPayload: Partial<QAPost> = {
        id: `qa-${Date.now()}`,
        authorMajor: `${profile.majorId.toUpperCase()} 전공`,
        authorYear: `${profile.currentYear}학년`,
        title: questionTitle,
        content: questionContent,
        tags: questionTags
          ? questionTags.split(',').map((t) => t.trim())
          : ['전공학업', '선배조언'],
        mentorId: targetMentorId,
        answer: {
          mentorName: chosenMentor.name,
          mentorAffiliation: chosenMentor.affiliation,
          content: answerContent,
          date: '방금 전',
        },
        createdAt: '방금 전',
        upvotes: 1,
      };

      // Persist to backend server
      const created = await createQAPost(newPostPayload);
      const postToAdd = created || (newPostPayload as QAPost);

      setQaPosts([postToAdd, ...qaPosts]);
      setIsQuestionModalOpen(false);
      setQuestionTitle('');
      setQuestionContent('');
      setQuestionTags('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              이공계 선배 멘토링 & 지식 나눔 라운지
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              선배 멘토링 & 전공 Q&A 커뮤니티
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              카이스트/서울대 대학원, 삼성전자, 현대차, 네이버 등에서 활약 중인 명문 이공계 선배들에게 
              학점 관리, 수강신청, 랩실 컨택 및 기술 면접 노하우를 직접 묻고 답변을 받아보세요.
            </p>
          </div>

          <button
            onClick={() => setIsQuestionModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            선배에게 질문하기
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            실시간 멘토링 Q&A ({qaPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'mentors'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            선배 멘토단 프로필 ({SENIOR_MENTORS.length}명)
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'articles'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            선배 지식 칼럼 & 수기 ({SENIOR_ARTICLES.length}편)
          </button>
        </div>
      </div>

      {/* Tab 1: Q&A Forum */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="질문 제목, 태그(예: 학부연구생, 알고리즘, 회로이론), 키워드로 검색"
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md hover:border-slate-700 transition-all space-y-3.5"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {post.authorMajor} • {post.authorYear}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {post.createdAt}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white hover:text-cyan-300 transition-colors">
                      {post.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleUpvote(post.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition-colors shrink-0"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.upvotes}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-cyan-400 border border-slate-800 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Senior Answer Card */}
                {post.answer && (
                  <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950/30 border border-cyan-800/40 relative">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow">
                          선배
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">
                            {post.answer.mentorName}
                          </span>
                          <span className="text-[10px] text-cyan-400 ml-2 font-mono">
                            {post.answer.mentorAffiliation}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {post.answer.date}
                      </span>
                    </div>

                    <div className="prose prose-invert prose-xs max-w-none text-xs text-slate-200 leading-relaxed">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(post.answer.content),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Mentors Directory */}
      {activeTab === 'mentors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SENIOR_MENTORS.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${mentor.avatarColor} flex items-center justify-center font-bold text-base text-white shadow-md`}
                    >
                      {mentor.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {mentor.name}
                      </h3>
                      <p className="text-[11px] text-cyan-400 font-medium">
                        {mentor.affiliation}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {mentor.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 font-mono">
                  🎓 {mentor.education}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {mentor.bio}
                </p>

                {/* Specialty Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {mentor.specialties.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  답변 {mentor.answersCount}건 • 도움 {mentor.helpfulCount}
                </span>

                <button
                  onClick={() => {
                    setTargetMentorId(mentor.id);
                    setIsQuestionModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  질문하기
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Knowledge Articles */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SENIOR_ARTICLES.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {article.readTime} 읽기
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white hover:text-cyan-300 transition-colors mb-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300">
                    {article.authorName}
                  </span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    전문 읽기 →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Full Article Modal */}
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {selectedArticle.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        작성자: {selectedArticle.authorName} ({selectedArticle.authorAffiliation})
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {selectedArticle.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(selectedArticle.content),
                    }}
                  />
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ask Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                선배에게 질문하기
              </h2>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  질문 대상 멘토 선택
                </label>
                <select
                  value={targetMentorId}
                  onChange={(e) => setTargetMentorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {SENIOR_MENTORS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.affiliation} ({m.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  질문 제목
                </label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="예: 2학년 2학기 알고리즘과 컴퓨터구조 동시 수강 로드가 감당될까요?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  구체적인 질문 내용
                </label>
                <textarea
                  required
                  rows={4}
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="현재 수강한 과목, 고민하는 지점, 목표 등을 상세히 작성해 주시면 선배가 훨씬 구체적인 조언을 드릴 수 있습니다."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={questionTags}
                  onChange={(e) => setQuestionTags(e.target.value)}
                  placeholder="예: 수강신청, 학점관리, 컴공"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2 text-[11px] text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>질문 등록 시 선택한 선배의 전문 지식과 페르소나를 기반으로 즉시 맞춤 답변이 생성됩니다.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center gap-1.5 shadow"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      선배 멘토 답변 생성 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      질문 등록하기
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
