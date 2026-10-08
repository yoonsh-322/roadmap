import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  BrainCircuit, 
  GraduationCap, 
  FlaskConical, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { MENTOR_PERSONAS } from '../data/stemMajors';
import { ChatMessage, MentorPersona, StudentProfile } from '../types/stem';
import { renderMarkdown } from '../utils/markdown';
import { saveChatHistory } from '../utils/api';

interface GeminiMentorChatProps {
  profile: StudentProfile;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const GeminiMentorChat: React.FC<GeminiMentorChatProps> = ({
  profile,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<MentorPersona>('senior_mentor');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `안녕하세요! **STEM Compass 학업 어드바이저**입니다. 🎓\n\n이공계 학부 생활 중 전공 과목 공부법, 선수과목 이수 체계, 학부연구생(랩실) 컨택, 대학원 진학 및 테크 기업 취업에 대해 무엇이든 편하게 물어보세요!\n\n현재 학생 프로필: **${profile.majorId.toUpperCase()} 전공, ${profile.currentYear}학년 ${profile.currentSemester}학기**로 설정되어 있습니다.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activePersona = MENTOR_PERSONAS.find((p) => p.id === selectedPersonaId) || MENTOR_PERSONAS[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from backend on mount
  useEffect(() => {
    fetch('/api/storage/chat-history')
      .then((res) => (res.ok ? res.json() : []))
      .then((history) => {
        if (Array.isArray(history) && history.length > 0) {
          setMessages(history);
        }
      })
      .catch((e) => console.error('Failed to load chat history:', e));
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming initial prompt from other tabs
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
      textareaRef.current?.focus();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    const botMsgId = `bot-${Date.now()}`;
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, initialBotMsg]);

    try {
      // Build tailored system instruction embedding student context
      const contextualSystemInstruction = `${activePersona.systemPrompt}

[현재 상담 학생 프로필]
- 전공: ${profile.majorId.toUpperCase()}
- 학년/학기: ${profile.currentYear}학년 ${profile.currentSemester}학기
- 기이수 완료 과목 수: ${profile.completedCourseIds.length}과목
- 희망 진로: ${profile.careerGoal || '미정 (대학원 또는 테크 기업)'}
- 목표 평점: ${profile.targetGpa || 3.8}

위 학생의 전공 및 학년 상황을 반드시 고려하여 맞춤형으로 공감하고 실천 가능한 솔루션을 제공해 주세요.`;

      // Multi-turn messages payload
      const chatPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatPayload,
          systemInstruction: contextualSystemInstruction,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('응답을 가져올 수 없습니다.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, content: accumulatedText } : m
                  )
                );
              }
            } catch (err) {
              // ignore JSON parse partial chunk
            }
          }
        }
      }
      // Save to backend storage
      const finalBotMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        content: accumulatedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveChatHistory([...newMessages, finalBotMsg]);
    } catch (err: unknown) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? { ...m, content: '답변을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('대화 기록을 초기화하시겠습니까?')) {
      const resetMsg: ChatMessage = {
        id: 'welcome-reset',
        role: 'assistant',
        content: `대화가 초기화되었습니다. 새로운 질문을 입력해 주세요! (현재 멘토: **${activePersona.title}**)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([resetMsg]);
      saveChatHistory([resetMsg]);
    }
  };

  const handleExportChat = () => {
    const exportText = messages
      .map(
        (m) =>
          `[${m.role === 'user' ? '학생' : 'AI 멘토'} - ${m.timestamp}]\n${m.content}\n\n`
      )
      .join('---\n\n');

    const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stem-mentor-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    '선형대수학과 미적분학 이후 AI 트랙 과목 추천해 줘',
    '학부 연구생 지원 시 교수님께 어필할 점과 준비 사항',
    '전공 학점이 3점대 초반인데 메이크업 전략은?',
    '자료구조와 알고리즘 공부할 때 시간 효율적인 팁',
    '코딩테스트 준비와 학점 관리를 병행하는 스케줄링 방법',
  ];

  return (
    <div className="flex flex-col h-[750px] bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Top Header & Persona Switcher */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Gemini 이공계 학업 멘토
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              다회차 대화 맥락 유지 • 전공별 실전 학업 & 커리어 조언
            </p>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl overflow-x-auto scrollbar-none">
          {MENTOR_PERSONAS.map((persona) => {
            const isSelected = selectedPersonaId === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => setSelectedPersonaId(persona.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{persona.title}</span>
              </button>
            );
          })}
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={handleExportChat}
            title="대화 내보내기 (Markdown)"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearChat}
            title="대화 초기화"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Badge Banner */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            멘토 역할: <strong>{activePersona.title}</strong> ({activePersona.badge})
          </span>
        </div>
        <span className="hidden sm:inline font-mono">
          [주입된 맥락: {profile.majorId.toUpperCase()} • {profile.currentYear}학년 {profile.currentSemester}학기]
        </span>
      </div>

      {/* Scrollable Chat Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800/90 text-slate-200 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div
                    className="prose prose-invert prose-xs sm:prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(msg.content),
                    }}
                  />
                )}

                {/* Footer Time & Copy */}
                <div
                  className={`flex items-center gap-2 mt-2 pt-1.5 border-t ${
                    isUser
                      ? 'border-white/20 text-cyan-100 justify-end'
                      : 'border-slate-800 text-slate-500 justify-between'
                  } text-[10px] font-mono`}
                >
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === msg.id ? '복사됨' : '복사'}</span>
                    </button>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl shrink-0 bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>답변을 작성하고 있습니다...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> 추천 질문:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`${activePersona.title}에게 질문을 입력하세요... (Shift+Enter로 줄바꿈)`}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="h-11 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">전송</span>
          </button>
        </form>
      </div>
    </div>
  );
};
