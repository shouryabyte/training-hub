const { Router } = require("express");
const { z } = require("zod");

const { protect } = require("../middleware/authMiddleware");
const { aiQuota } = require("../middleware/aiQuotaMiddleware");
const { validate } = require("../middleware/validate");
const {
  resumeEval,
  roadmap,
  voiceInterview,
  resumeAnalyze,
  mockQuestion,
  careerRoadmap,
  explainCode,
  debug,
} = require("../controllers/ai.controller");

const r = Router();

const resumeSchema = z.object({
  body: z.object({
    resumeText: z.string().min(10),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const roadmapSchema = z.object({
  body: z.object({
    target: z.string().min(2),
    currentKnowledge: z.string().min(2),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const voiceSchema = z.object({
  body: z.object({
    mode: z.enum(["DSA", "SYSTEM_DESIGN", "HR"]).default("HR"),
    history: z
      .array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
        })
      )
      .optional()
      .default([]),
    transcript: z.string().min(2),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const resumeAnalyzeSchema = z.object({
  body: z.object({
    resumeText: z.string().min(10),
    category: z.string().min(2),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const mockQuestionSchema = z.object({
  body: z.object({
    role: z.string().min(2),
    level: z.string().min(2),
    history: z.any().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const careerRoadmapSchema = z.object({
  body: z.object({
    targetRole: z.string().min(2),
    currentSkills: z.string().min(2),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const explainCodeSchema = z.object({
  body: z.object({
    problem: z.string().min(2),
    code: z.string().min(2),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

const debugCodeSchema = z.object({
  body: z.object({
    problem: z.string().min(2),
    description: z.string().min(2),
    code: z.string().min(2),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
});

// AI Command Center endpoints (keeps existing UI working without exposing API keys client-side)
r.post("/resume-eval", protect, aiQuota("resume"), validate(resumeSchema), resumeEval);
r.post("/roadmap", protect, aiQuota("roadmap"), validate(roadmapSchema), roadmap);
r.post("/voice-interview", protect, aiQuota("voice"), validate(voiceSchema), voiceInterview);

r.post("/resume-analyze", protect, aiQuota("resume"), validate(resumeAnalyzeSchema), resumeAnalyze);
r.post("/mock-question", protect, aiQuota("voice"), validate(mockQuestionSchema), mockQuestion);
r.post("/career-roadmap", protect, aiQuota("roadmap"), validate(careerRoadmapSchema), careerRoadmap);
r.post("/explain-code", protect, aiQuota("voice"), validate(explainCodeSchema), explainCode);
r.post("/debug-code", protect, aiQuota("voice"), validate(debugCodeSchema), debug);

module.exports = r;
