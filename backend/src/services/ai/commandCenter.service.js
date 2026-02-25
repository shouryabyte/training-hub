const { generateJson, generateText } = require("./aiClient");
const { resumeAnalyzeFallback, roadmapFallback } = require("./fallback");
const { cacheKey, getCachedResponse, setCachedResponse, normalizeText } = require("../../utils/aiCache");

async function analyzeResume({ resumeText, category }) {
  const normalized = normalizeText(resumeText);
  const version = "resume-analyze:v2";
  const key = cacheKey({ feature: "resume-analyze", version, parts: [category || "", normalized] });
  const cached = await getCachedResponse({ key });
  if (cached?.response) return { provider: cached.provider || "cache", ...cached.response };

  const system =
    "You are a professional career coach and hiring manager. Output strictly valid JSON only.";
  const user = `Analyze this resume for a ${category} student.\nResume Text:\n${normalized}\n\nReturn JSON with properties:\n- feedback (string, 6-12 sentences, structured with headings)\n- suggestions (string[], 6-14, concrete ATS-safe actions)\n- score (0-100)\n\nRules:\n- Be deterministic: for the same input, return the same score and suggestions.\n- Do not hallucinate details not present in the resume.\n`;
  try {
    const result = await generateJson({ system, user, temperature: 0 });
    await setCachedResponse({
      key,
      feature: "resume-analyze",
      provider: "ai",
      model: String(process.env.AI_PROVIDER || ""),
      response: result,
      ttlMs: Number(process.env.AI_CACHE_TTL_MS || 30 * 24 * 60 * 60 * 1000),
    });
    return { provider: "ai", ...result };
  } catch (_err) {
    return resumeAnalyzeFallback(resumeText, category);
  }
}

async function mockInterviewQuestion({ role, level, history }) {
  const system =
    "You are a technical interviewer at a top tech company. Ask the next relevant interview question.";
  const user = `Candidate is applying for ${role} at ${level} level.\nConversation history JSON:\n${JSON.stringify(
    history || [],
    null,
    2
  )}\n\nReturn only the next question as plain text.`;
  try {
    return await generateText({ system, user });
  } catch (_err) {
    return `Fallback question: For a ${role} (${level}) candidate, explain your approach and tradeoffs for a recent project.`;
  }
}

async function generateCareerRoadmap({ targetRole, currentSkills }) {
  const normalizedSkills = normalizeText(currentSkills);
  const version = "career-roadmap:v2";
  const key = cacheKey({ feature: "career-roadmap", version, parts: [targetRole || "", normalizedSkills] });
  const cached = await getCachedResponse({ key });
  if (cached?.response) return { provider: cached.provider || "cache", ...cached.response };

  const system =
    "You are a senior career strategist. Output strictly valid JSON only.";
  const user = `Generate a 6-month career roadmap for a student aiming to become a ${targetRole}.\nCurrent skills: ${normalizedSkills}\n\nReturn JSON with keys:\n- summary (string, 4-8 sentences)\n- monthlyPlan (array of { month: string, milestone: string, tasks: string[], projects: string[], checkpoint: string })\n- weeklyKickstart (array of { week: number, focus: string, deliverables: string[] } for the first 4 weeks)\n- skillPriorityOrder (string[])\n- nextActions (string[], 5-10)\n- commonPitfalls (string[], 4-10)\n\nRules:\n- Be deterministic for the same input.\n- Keep tasks measurable and time-boxed.\n`;
  try {
    const result = await generateJson({ system, user, temperature: 0 });
    await setCachedResponse({
      key,
      feature: "career-roadmap",
      provider: "ai",
      model: String(process.env.AI_PROVIDER || ""),
      response: result,
      ttlMs: Number(process.env.AI_CACHE_TTL_MS || 30 * 24 * 60 * 60 * 1000),
    });
    return { provider: "ai", ...result };
  } catch (_err) {
    return roadmapFallback(targetRole, currentSkills);
  }
}

async function explainCodeLogic({ problem, code }) {
  const system =
    "You are a senior software engineer. Provide a concise explanation and edge cases.";
  const user = `Explain the logic of this code for the problem: \"${problem}\".\n\nCode:\n${code}`;
  try {
    return await generateText({ system, user });
  } catch (_err) {
    return `Fallback explanation: Review the solution approach for \"${problem}\" and ensure correct handling of edge cases. Consider time/space complexity and validate with tests.`;
  }
}

async function debugCode({ problem, description, code }) {
  const system =
    "You are a world-class debugging expert. Respond with headings and a corrected implementation snippet.";
  const user = `Analyze the following code for the DSA problem: \"${problem}\".\n\nProblem Description:\n${description}\n\nUser's Current Code:\n${code}\n\nProvide:\n1) Identify errors/edge cases\n2) Corrected Implementation\n3) Step-by-step debugging process`;
  try {
    return await generateText({ system, user });
  } catch (_err) {
    return `Fallback debugging report:\n1) Re-check constraints and edge cases for \"${problem}\".\n2) Add tests for boundary inputs described in the prompt.\n3) Validate correctness and complexity.`;
  }
}

module.exports = {
  analyzeResume,
  mockInterviewQuestion,
  generateCareerRoadmap,
  explainCodeLogic,
  debugCode,
};
