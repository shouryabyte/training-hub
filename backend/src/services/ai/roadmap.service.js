const { z } = require("zod");

const { generateJson } = require("./aiClient");
const { roadmapFallback } = require("./fallback");
const { cacheKey, getCachedResponse, setCachedResponse, normalizeText } = require("../../utils/aiCache");

const RoadmapSchema = z.object({
  summary: z.string().min(10),
  phases: z
    .array(
      z.object({
        phase: z.number().int().min(1).max(6),
        title: z.string().min(3).max(60),
        objective: z
          .string()
          .min(8)
          .max(240)
          .refine((v) => !String(v).includes("\n"), { message: "objective must be one bullet line" }),
        toolsTechnologies: z
          .string()
          .min(8)
          .max(240)
          .refine((v) => !String(v).includes("\n"), { message: "toolsTechnologies must be one bullet line" }),
        implementationSteps: z
          .string()
          .min(8)
          .max(240)
          .refine((v) => !String(v).includes("\n"), { message: "implementationSteps must be one bullet line" }),
        expectedOutcome: z
          .string()
          .min(8)
          .max(240)
          .refine((v) => !String(v).includes("\n"), { message: "expectedOutcome must be one bullet line" }),
      })
    )
    .length(6)
    .default([]),
  prerequisites: z.array(z.string()).max(5).optional().default([]),
  targetStack: z.array(z.string()).max(5).optional().default([]),
  weeklyPlan: z
    .array(
      z.object({
        week: z.number().int().min(1),
        goals: z.array(z.string()).max(5).optional().default([]),
        topics: z.array(z.string()).max(5).optional().default([]),
        resources: z.array(z.string()).max(5).optional().default([]),
        deliverables: z.array(z.string()).max(5).optional().default([]),
        assessment: z.string().optional().default(""),
      })
    )
    .min(8)
    .max(12)
    .optional()
    .default([]),
  monthlyPlan: z
    .array(
      z.object({
        month: z.string().min(1),
        goals: z.array(z.string()).max(5).optional().default([]),
        projects: z.array(z.string()).max(5).optional().default([]),
        checkpoints: z.array(z.string()).max(5).optional().default([]),
      })
    )
    .min(3)
    .max(6)
    .optional()
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(5),
        stack: z.array(z.string()).max(10).optional().default([]),
        acceptanceCriteria: z.array(z.string()).max(10).optional().default([]),
      })
    )
    .optional()
    .default([]),
  studySystem: z
    .object({
      hoursPerWeek: z.number().min(1).max(80).optional(),
      scheduleTemplate: z.array(z.string()).optional().default([]),
      reviewLoop: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({ scheduleTemplate: [], reviewLoop: [] }),

  // Backward-compatible keys expected by existing UI
  milestones: z
    .array(
      z.object({
        timeframe: z.string().min(1),
        goals: z.array(z.string()).optional().default([]),
        resources: z.array(z.string()).optional().default([]),
        projects: z.array(z.string()).optional().default([]),
      })
    )
    .optional()
    .default([]),
  skillPriorityOrder: z.array(z.string()).max(6).optional().default([]),
  nextActions: z.array(z.string()).min(7).max(10).optional().default([]),
  commonPitfalls: z.array(z.string()).min(5).max(10).optional().default([]),
});

function toLegacyMilestones({ weeklyPlan, monthlyPlan }) {
  const milestones = [];
  if (Array.isArray(weeklyPlan) && weeklyPlan.length) {
    milestones.push({
      timeframe: "Weeks 1-4",
      goals: weeklyPlan
        .filter((w) => w.week >= 1 && w.week <= 4)
        .flatMap((w) => (w.goals || []).slice(0, 2))
        .slice(0, 8),
      resources: weeklyPlan
        .filter((w) => w.week >= 1 && w.week <= 4)
        .flatMap((w) => (w.resources || []).slice(0, 2))
        .slice(0, 8),
      projects: weeklyPlan
        .filter((w) => w.week >= 1 && w.week <= 4)
        .flatMap((w) => (w.deliverables || []).slice(0, 2))
        .slice(0, 8),
    });
  }
  if (Array.isArray(monthlyPlan) && monthlyPlan.length) {
    for (const m of monthlyPlan.slice(0, 3)) {
      milestones.push({
        timeframe: String(m.month),
        goals: (m.goals || []).slice(0, 6),
        resources: [],
        projects: (m.projects || []).slice(0, 6),
      });
    }
  }
  return milestones;
}

async function agenticGenerateRoadmap({ system, user, schema }) {
  const maxAttempts = 3;
  let lastErr = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const result = await generateJson({ system, user: `${user}\n\nAttempt: ${attempt}/${maxAttempts}.`, temperature: 0 });
    const parsed = schema.safeParse(result);
    if (parsed.success) return parsed.data;
    lastErr = parsed.error.message;
    user = `${user}\n\nYour previous JSON did not match the schema. Fix it. Validation errors:\n${lastErr}\nReturn JSON only.`;
  }
  throw new Error(lastErr || "Failed to generate roadmap");
}

async function createRoadmap({ target, currentKnowledge }) {
  const normalizedTarget = normalizeText(target);
  const normalizedKnowledge = normalizeText(currentKnowledge);
  const version = "roadmap:v4";
  const key = cacheKey({ feature: "roadmap", version, parts: [normalizedTarget, normalizedKnowledge] });
  const cached = await getCachedResponse({ key });
  if (cached?.response) return { provider: cached.provider || "cache", ...cached.response };

  const system =
    "You are a senior engineering manager and career strategist. Output strictly valid JSON only. Be deterministic for identical inputs.";

  let user = `Define the target role clearly and produce a strict, actionable roadmap.\n\nTarget trajectory (role + goal): ${normalizedTarget}\nCurrent knowledge base: ${normalizedKnowledge}\n\nOutput Format Rules (STRICT):\n- Use headings + bullet points only (no long paragraphs).\n- No paragraph longer than 3 lines (prefer 1 line).\n- Maximum 5 points per section.\n- Do not add generic explanations.\n- Focus only on actionable steps.\n- Avoid repetition.\n- Write concise technical language.\n- No motivational content.\n- No unnecessary introduction or conclusion.\n\nDEPTH CONSTRAINT:\nStructure the roadmap into 6 clearly numbered phases.\nEach phase must contain EXACTLY 4 bullet points (no more, no less):\n1) Objective\n2) Tools/Technologies\n3) Implementation Steps\n4) Expected Outcome\n\nReturn JSON with keys:\n- summary (1-3 lines)\n- prerequisites (string[], max 5)\n- targetStack (string[], max 5)\n- phases (array length 6 of { phase (1-6), title, objective, toolsTechnologies, implementationSteps, expectedOutcome })\n- weeklyPlan (array, 8-12 items; each week should include goals/topics/resources/deliverables; each list max 5)\n- monthlyPlan (array, 3-6 items; each month includes goals/projects/checkpoints; each list max 5)\n- projects (array, 2-4 items with name/description/stack/acceptanceCriteria)\n- skillPriorityOrder (string[], max 6)\n- nextActions (string[], 7-10)\n- commonPitfalls (string[], 5-10)\n- milestones (array of { timeframe, goals[], resources[], projects[] })\n\nConstraints for phases fields:\n- objective/toolsTechnologies/implementationSteps/expectedOutcome must each be ONE bullet line (no newlines).\n- Be deterministic for the same input.`;

  try {
    const result = await agenticGenerateRoadmap({ system, user, schema: RoadmapSchema });
    const milestones =
      (result.milestones || []).length
        ? result.milestones
        : (result.phases || []).map((p) => ({
            timeframe: `Phase ${p.phase}: ${p.title}`,
            goals: [p.objective, p.implementationSteps].filter(Boolean),
            resources: [p.toolsTechnologies].filter(Boolean),
            projects: [p.expectedOutcome].filter(Boolean),
          }));
    const final = { ...result, milestones };

    await setCachedResponse({
      key,
      feature: "roadmap",
      provider: "ai",
      model: String(process.env.AI_PROVIDER || ""),
      response: final,
      ttlMs: Number(process.env.AI_CACHE_TTL_MS || 30 * 24 * 60 * 60 * 1000),
    });

    return { provider: "ai", ...final };
  } catch (_err) {
    return roadmapFallback(target, currentKnowledge);
  }
}

module.exports = { createRoadmap };
