import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { readStorage, writeStorage, BackendStorageData } from './src/server/storage';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// Backend Data Persistence Endpoints (Storage)
// ==========================================

// Get entire backend storage state
app.get('/api/storage/all', (_req, res) => {
  try {
    const data = readStorage();
    res.json(data);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Update Student Profile
app.post('/api/storage/profile', (req, res) => {
  try {
    const data = readStorage();
    data.profile = { ...data.profile, ...req.body };
    writeStorage(data);
    res.json({ success: true, profile: data.profile });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Get Q&A Posts
app.get('/api/storage/qa', (_req, res) => {
  try {
    const data = readStorage();
    res.json(data.qaPosts || []);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Create Q&A Post
app.post('/api/storage/qa', (req, res) => {
  try {
    const data = readStorage();
    const newPost = {
      id: req.body.id || `qa-${Date.now()}`,
      authorMajor: req.body.authorMajor || '컴퓨터공학과',
      authorYear: req.body.authorYear || '2학년',
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      mentorId: req.body.mentorId,
      answer: req.body.answer,
      createdAt: req.body.createdAt || new Date().toISOString().slice(0, 10),
      upvotes: req.body.upvotes || 0,
    };
    data.qaPosts = [newPost, ...(data.qaPosts || [])];
    writeStorage(data);
    res.json({ success: true, post: newPost });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Upvote Q&A Post
app.post('/api/storage/qa/:id/upvote', (req, res) => {
  try {
    const data = readStorage();
    const post = (data.qaPosts || []).find((p) => p.id === req.params.id);
    if (post) {
      post.upvotes = (post.upvotes || 0) + 1;
      writeStorage(data);
      res.json({ success: true, upvotes: post.upvotes });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Get Saved Plans
app.get('/api/storage/saved-plans', (_req, res) => {
  try {
    const data = readStorage();
    res.json(data.savedPlans || []);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Save a New Plan
app.post('/api/storage/saved-plans', (req, res) => {
  try {
    const data = readStorage();
    const newPlan = {
      id: req.body.id || `plan-${Date.now()}`,
      title: req.body.title || '맞춤 학습 계획',
      major: req.body.major,
      year: req.body.year,
      semester: req.body.semester,
      careerGoal: req.body.careerGoal,
      planContent: req.body.planContent,
      createdAt: new Date().toISOString(),
    };
    data.savedPlans = [newPlan, ...(data.savedPlans || [])];
    writeStorage(data);
    res.json({ success: true, plan: newPlan });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Delete Saved Plan
app.delete('/api/storage/saved-plans/:id', (req, res) => {
  try {
    const data = readStorage();
    data.savedPlans = (data.savedPlans || []).filter((p) => p.id !== req.params.id);
    writeStorage(data);
    res.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Get Chat History
app.get('/api/storage/chat-history', (_req, res) => {
  try {
    const data = readStorage();
    res.json(data.chatHistory || []);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Save Chat History
app.post('/api/storage/chat-history', (req, res) => {
  try {
    const data = readStorage();
    data.chatHistory = req.body.messages || [];
    writeStorage(data);
    res.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Update Checklist
app.post('/api/storage/checklist', (req, res) => {
  try {
    const data = readStorage();
    data.checklist = { ...data.checklist, ...req.body };
    writeStorage(data);
    res.json({ success: true, checklist: data.checklist });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Multi-turn Gemini Chat Endpoint with Streaming (SSE)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, stream = true } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Format messages for @google/genai SDK
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const defaultSystem = `당신은 대한민국 이공계(STEM) 학부생들을 위한 최고의 전문 학업 어드바이저이자 따뜻하고 명쾌한 멘토 'STEM Compass'입니다.
학생들의 질문에 대해 다음 원칙을 지키며 답변하세요:
1. 전공 학업 로드맵, 선수과목(Prerequisite) 연계성, 과목별 공부법(수학, 물리, 코딩, 실험/실습 등)에 대해 구체적이고 현실적인 가이드를 제공합니다.
2. 학점(GPA) 관리 전략, 시험 대비(중간/기말), 팀 프로젝트 및 캡스톤 디자인 노하우를 친절하고 명확하게 안내합니다.
3. 학부 연구생(Lab Intern), 대학원 진학(석사/박사/유학) 및 테크/엔지니어링 기업 취업(코딩테스트, 기술면접, 포트폴리오)에 대한 실전 조언을 제공합니다.
4. 가독성을 위해 마크다운(Markdown)을 적극 활용(목록, 볼드체, 소제목, 수식 및 코드 블록 등)하여 일목요연하게 정리해 주세요.
5. 학생이 처한 학년과 전공 맥락을 항상 고려하여 현실적이면서도 긍정적인 동기부여를 심어주세요.`;

    const effectiveSystemInstruction = systemInstruction || defaultSystem;

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: effectiveSystemInstruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      return res.end();
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: effectiveSystemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text || '' });
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gemini API Chat Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || 'Gemini API 호출 중 오류가 발생했습니다.',
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      return res.end();
    }
  }
});

// Dedicated Semester Plan Review & Workload Analyzer
app.post('/api/analyze-plan', async (req, res) => {
  try {
    const { major, year, semester, selectedCourses, careerGoal } = req.body;

    const prompt = `[이공계 학부생 수강 계획 분석 요청]
- 전공: ${major}
- 대상 학년/학기: ${year}학년 ${semester}학기
- 선택한 수강 과목들:
${(selectedCourses || []).map((c: { name: string; credits: number; category: string }) => `  - ${c.name} (${c.credits}학점, ${c.category})`).join('\n')}
- 희망 진로/목표: ${careerGoal || '미정 (대학원 또는 테크 기업)'}

다음 항목을 바탕으로 전문가적인 수강 계획 진단 리포트를 작성해 주세요:
1. 총 학점 및 학습 로드(Workload) 평가 (과제량, 시험 부담, 5점 만점 난이도)
2. 선수과목 연계 및 이수 순서의 적절성 평가 (누락되거나 위험한 과목이 있는지)
3. 진로 목표와의 부합도 및 시너지 효과
4. 이번 학기 A+ 학점 달성을 위한 실전 학업 전략 3가지
5. 학기 중 추천 연계 비교과 활동 (학부연구생 컨택, 알고리즘 스터디, 공모전 등)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '당신은 카이스트/서울대 수준의 명문 공대 수석 졸업생이자 학업 멘토입니다. 매우 실용적이고 체계적이며 날카로운 피드백을 마크다운으로 제공하세요.',
        temperature: 0.6,
      },
    });

    return res.json({ analysis: response.text || '' });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Plan Analysis Error:', error);
    return res.status(500).json({ error: error.message || '분석 중 오류 발생' });
  }
});

// Dedicated Contact Email Draft Generator
app.post('/api/generate-contact-email', async (req, res) => {
  try {
    const { professorName, labTopic, studentMajor, studentYear, studentBackground, purpose } = req.body;

    const prompt = `[이공계 연구실 교수님 컨택 이메일 작성 요청]
- 교수님 성함: ${professorName} 교수님
- 연구실 연구 분야: ${labTopic}
- 학생 전공/학년: ${studentMajor} ${studentYear}학년
- 학생 배경/수강 과목/관심사: ${studentBackground}
- 목적: ${purpose || '학부 연구생 (Lab Intern) 지원'}

이공계 교수님들이 실제로 읽고 긍정적으로 검토하는 최적의 정중하고 명확한 이메일 전문을 작성해 주세요.
포함 내용:
1. 명확하고 격식 있는 이메일 제목 (이름, 학번/학년, 목적 포함)
2. 정중한 도입 인사 및 교수님 연구 분야에 대한 구체적 관심 계기 (단순 찬양이 아닌 구체적 논문/키워드 언급 가이드 포함)
3. 본인의 준비도(수강한 기초/전공 과목, 다뤄본 프로그래밍 언어/툴, 성적 등) 어필
4. 연구실 참여 희망 기간 및 포부
5. 정중한 면담(오프라인 또는 Zoom) 요청 및 맺음말
6. 첨부 서류 안내 (CV, 성적증명서 등)
추가로 '교수님께 이메일 발송 시 주의해야 할 3가지 팁'도 덧붙여 주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '당신은 수많은 학부연구생과 대학원생을 지도해 온 공대 교수이자 멘토입니다. 교수님 관점에서 설득력 있고 깔끔한 이메일 양식을 작성하세요.',
        temperature: 0.5,
      },
    });

    return res.json({ draft: response.text || '' });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Email Generation Error:', error);
    return res.status(500).json({ error: error.message || '이메일 생성 중 오류 발생' });
  }
});

// Personalized Study Plan & Course Recommendation Generator
app.post('/api/generate-personalized-plan', async (req, res) => {
  try {
    const { major, year, semester, interests, careerGoal, completedCourses, targetGpa, studyHoursPerWeek } = req.body;

    const prompt = `[이공계 학부생 개인 맞춤형 학습 계획 및 로드맵 수립 요청]
- 전공: ${major}
- 현재 학년/학기: ${year}학년 ${semester}학기
- 세부 관심사/연구 분야: ${interests || '전반적인 전공 역량 강화'}
- 희망 진로 목표: ${careerGoal || '테크 기업 R&D 취업 또는 대학원'}
- 현재까지 이수한 과목들: ${(completedCourses || []).join(', ') || '없음(신입생/초기)'}
- 목표 학점(GPA): ${targetGpa || '3.8 이상'}
- 주당 가용 학습 시간: ${studyHoursPerWeek || '25시간 내외'}

이 학생만을 위한 정밀한 개인 맞춤형 학업 전략 보고서를 작성해 주세요:
1. 🎯 학업 진단 및 진로 정합성 분석 (관심사와 진로 목표를 달성하기 위해 지금 시기에 가장 중요한 역량)
2. 📚 남은 학기별 최적 추천 수강 과목 로드맵 (선수과목 꼬임 방지, 학점 밸런스 고려)
3. ⚠️ 수강 신청 시 주의해야 할 위험 과목 및 헬(Hell) 과목 분산 이수 전략
4. 💡 진로 맞춤형 비교과 액션 플랜 (학부연구생 컨택 시기, 추천 깃허브 프로젝트 주제, 공모전/인턴십 타임라인)
5. ⏱️ 주당 학습 시간 효율화 및 A+ 학점 관리 실전 팁`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '당신은 카이스트/MIT 출신의 수석 학업 카운슬러이자 전공 멘토입니다. 매우 현실적이고 구체적이며 동기부여가 되는 조언을 깔끔한 마크다운으로 작성하세요.',
        temperature: 0.6,
      },
    });

    return res.json({ plan: response.text || '' });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Personalized Plan Error:', error);
    return res.status(500).json({ error: error.message || '맞춤 계획 생성 중 오류 발생' });
  }
});

// Senior Mentor Q&A AI Response Generator
app.post('/api/mentor-qa-answer', async (req, res) => {
  try {
    const { mentorRole, questionTitle, questionContent, studentMajor, studentYear } = req.body;

    const prompt = `[이공계 선배 멘토링 Q&A 질문 답변 요청]
- 답변하는 선배 페르소나: ${mentorRole}
- 질문자 정보: ${studentMajor} ${studentYear}학년 학부생
- 질문 제목: ${questionTitle}
- 질문 내용: ${questionContent}

이 질문에 대해 해당 선배의 시각에서 생생하고 구체적인 경험담, 현실적인 팁, 실행 가능한 해법을 담아 정성껏 답변해 주세요.
- 인사말과 공감으로 시작
- 핵심 조언 3~4가지 (경험 사례 포함)
- 추가 팁 또는 주의할 점
- 응원의 마무리 메시지`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '당신은 후배를 진심으로 아끼는 명문대 이공계 선배 멘토입니다. 실무/대학원 연구 경험을 살려 친근하고 깊이 있는 마크다운 답변을 작성하세요.',
        temperature: 0.7,
      },
    });

    return res.json({ answer: response.text || '' });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Mentor QA Answer Error:', error);
    return res.status(500).json({ error: error.message || '답변 생성 중 오류 발생' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[STEM Compass Server] Running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
