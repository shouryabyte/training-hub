import { apiJson } from './apiClient';

export type ResumeEvalResult = {
  provider?: string;
  summary?: string;
  verdict?: 'Strong' | 'Needs Work' | 'Weak' | string;
  resumeStrengthScore?: number;
  atsCompatibility?: number;
  atsBreakdown?: {
    formatting?: number;
    keywords?: number;
    structure?: number;
    experienceImpact?: number;
    skills?: number;
    education?: number;
  };
  topStrengths?: string[];
  skillGaps?: string[];
  improvementSuggestions?: string[];
  rewriteExamples?: Array<{ before: string; after: string }>;
  industryAlignment?: string;
};

export async function resumeEval(resumeText: string) {
  return apiJson<ResumeEvalResult>('/api/ai/resume-eval', {
    method: 'POST',
    body: JSON.stringify({ resumeText }),
  });
}

export type RoadmapResult = {
  provider?: string;
  summary?: string;
  milestones?: Array<{
    timeframe: string;
    goals: string[];
    resources: string[];
    projects: string[];
  }>;
  skillPriorityOrder?: string[];
  nextActions?: string[];
  commonPitfalls?: string[];
};

export async function roadmap(target: string, currentKnowledge: string) {
  return apiJson<RoadmapResult>('/api/ai/roadmap', {
    method: 'POST',
    body: JSON.stringify({ target, currentKnowledge }),
  });
}

export type InterviewMode = 'DSA' | 'SYSTEM_DESIGN' | 'HR';

export type InterviewTurn = { question: string; answer: string };

export type VoiceInterviewResult = {
  provider?: string;
  nextQuestion?: string;
  feedbackSummary?: string;
  detailedFeedback?: string;
  confidenceScore?: number;
  technicalAccuracyScore?: number;
  clarityScore?: number;
  communicationScore?: number;
  strengths?: string[];
  improvementTips?: string[];
  detectedFillers?: string[];
  suggestedRewrite?: string;
  nextPracticePrompt?: string;
};

export async function voiceInterview(mode: InterviewMode, history: InterviewTurn[], transcript: string) {
  return apiJson<VoiceInterviewResult>('/api/ai/voice-interview', {
    method: 'POST',
    body: JSON.stringify({ mode, history, transcript }),
  });
}
