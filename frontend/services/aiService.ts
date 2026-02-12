
import { apiJson } from './apiClient';

export const analyzeResume = async (resumeText: string, category: string) => {
  return apiJson('/api/ai/resume-analyze', {
    method: 'POST',
    body: JSON.stringify({ resumeText, category }),
  });
};

export const getMockInterviewQuestion = async (role: string, level: string, history: any[]) => {
  const r = await apiJson<{ text: string }>('/api/ai/mock-question', {
    method: 'POST',
    body: JSON.stringify({ role, level, history }),
  });
  return r.text;
};

export const generateCareerRoadmap = async (targetRole: string, currentSkills: string) => {
  return apiJson('/api/ai/career-roadmap', {
    method: 'POST',
    body: JSON.stringify({ targetRole, currentSkills }),
  });
};

export const explainCodeLogic = async (problem: string, code: string) => {
  const r = await apiJson<{ text: string }>('/api/ai/explain-code', {
    method: 'POST',
    body: JSON.stringify({ problem, code }),
  });
  return r.text;
};

export const debugCode = async (problem: string, description: string, code: string) => {
  const r = await apiJson<{ text: string }>('/api/ai/debug-code', {
    method: 'POST',
    body: JSON.stringify({ problem, description, code }),
  });
  return r.text;
};
