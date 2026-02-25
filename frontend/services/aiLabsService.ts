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
  keywordTargets?: string[];
  sectionDiagnostics?: {
    formatting?: { status?: string; issues?: string[]; fixes?: string[] };
    experience?: { status?: string; issues?: string[]; fixes?: string[] };
    projects?: { status?: string; issues?: string[]; fixes?: string[] };
    skills?: { status?: string; issues?: string[]; fixes?: string[] };
    education?: { status?: string; issues?: string[]; fixes?: string[] };
  };
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
  phases?: Array<{
    phase: number;
    title: string;
    objective: string;
    toolsTechnologies: string;
    implementationSteps: string;
    expectedOutcome: string;
  }>;
  prerequisites?: string[];
  targetStack?: string[];
  weeklyPlan?: Array<{
    week: number;
    goals?: string[];
    topics?: string[];
    resources?: string[];
    deliverables?: string[];
    assessment?: string;
  }>;
  monthlyPlan?: Array<{
    month: string;
    goals?: string[];
    projects?: string[];
    checkpoints?: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    stack?: string[];
    acceptanceCriteria?: string[];
  }>;
  studySystem?: {
    hoursPerWeek?: number;
    scheduleTemplate?: string[];
    reviewLoop?: string[];
  };
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
