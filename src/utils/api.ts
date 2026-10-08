import { StudentProfile, ChatMessage } from '../types/stem';
import { QAPost } from '../data/mentorsData';

export interface SavedPlan {
  id: string;
  title: string;
  major: string;
  year: number;
  semester: number;
  careerGoal: string;
  planContent: string;
  createdAt: string;
}

export interface FullBackendState {
  profile: StudentProfile;
  qaPosts: QAPost[];
  savedPlans: SavedPlan[];
  chatHistory: ChatMessage[];
  checklist: Record<string, boolean>;
}

export async function fetchBackendStorage(): Promise<FullBackendState | null> {
  try {
    const res = await fetch('/api/storage/all');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch backend storage:', err);
    return null;
  }
}

export async function saveProfileToBackend(profile: Partial<StudentProfile>): Promise<boolean> {
  try {
    const res = await fetch('/api/storage/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save profile to backend:', err);
    return false;
  }
}

export async function fetchQAPosts(): Promise<QAPost[]> {
  try {
    const res = await fetch('/api/storage/qa');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch QA posts:', err);
    return [];
  }
}

export async function createQAPost(post: Partial<QAPost>): Promise<QAPost | null> {
  try {
    const res = await fetch('/api/storage/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post;
  } catch (err) {
    console.error('Failed to create QA post:', err);
    return null;
  }
}

export async function upvoteQAPost(id: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/storage/qa/${id}/upvote`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.upvotes;
  } catch (err) {
    console.error('Failed to upvote QA post:', err);
    return null;
  }
}

export async function savePlanToBackend(plan: {
  title: string;
  major: string;
  year: number;
  semester: number;
  careerGoal: string;
  planContent: string;
}): Promise<SavedPlan | null> {
  try {
    const res = await fetch('/api/storage/saved-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.plan;
  } catch (err) {
    console.error('Failed to save plan to backend:', err);
    return null;
  }
}

export async function fetchSavedPlans(): Promise<SavedPlan[]> {
  try {
    const res = await fetch('/api/storage/saved-plans');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch saved plans:', err);
    return [];
  }
}

export async function deleteSavedPlan(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/storage/saved-plans/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete saved plan:', err);
    return false;
  }
}

export async function saveChatHistory(messages: ChatMessage[]): Promise<boolean> {
  try {
    const res = await fetch('/api/storage/chat-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save chat history:', err);
    return false;
  }
}

export async function saveChecklistToBackend(checklist: Record<string, boolean>): Promise<boolean> {
  try {
    const res = await fetch('/api/storage/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checklist),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save checklist:', err);
    return false;
  }
}
