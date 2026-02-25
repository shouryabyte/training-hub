const { z } = require("zod");

const { generateJson } = require("./aiClient");
const { voiceInterviewFallback } = require("./fallback");
const { cacheKey, getCachedResponse, setCachedResponse, normalizeText } = require("../../utils/aiCache");

const VoiceResultSchema = z.object({
  nextQuestion: z.string().min(3).max(400).optional().default(""),
  feedbackSummary: z.string().min(10).max(900).optional().default(""),
  detailedFeedback: z.string().min(10).max(4000).optional().default(""),
  confidenceScore: z.number().min(0).max(100).optional(),
  technicalAccuracyScore: z.number().min(0).max(100).optional(),
  clarityScore: z.number().min(0).max(100).optional(),
  communicationScore: z.number().min(0).max(100).optional(),
  strengths: z.array(z.string()).optional().default([]),
  improvementTips: z.array(z.string()).optional().default([]),
  detectedFillers: z.array(z.string()).optional().default([]),
  suggestedRewrite: z.string().optional().default(""),
  nextPracticePrompt: z.string().optional().default(""),
});

async function agenticGenerate({ system, user, schema }) {
  const maxAttempts = 2;
  let lastErr = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const result = await generateJson({ system, user: `${user}\n\nAttempt: ${attempt}/${maxAttempts}.`, temperature: 0 });
    const parsed = schema.safeParse(result);
    if (parsed.success) return parsed.data;
    lastErr = parsed.error.message;
    user = `${user}\n\nYour previous JSON did not match the schema. Fix it. Validation errors:\n${lastErr}\nReturn JSON only.`;
  }
  throw new Error(lastErr || "Failed to generate interview feedback");
}

async function analyzeInterviewTurn({ mode, history, transcript }) {
  const normalizedTranscript = normalizeText(transcript);
  const normalizedHistory = Array.isArray(history) ? history.slice(-6) : [];
  const version = "voice-interview:v2";
  const key = cacheKey({
    feature: "voice-interview",
    version,
    parts: [String(mode || "").toUpperCase(), JSON.stringify(normalizedHistory), normalizedTranscript],
  });
  const cached = await getCachedResponse({ key });
  if (cached?.response) return { provider: cached.provider || "cache", ...cached.response };

  const system = "You are a world-class interview coach. Output strictly valid JSON only. Be deterministic for identical inputs.";
  const user = `We are running a mock interview.\nMode: ${String(mode || "").toUpperCase()}\n\nConversation History (array of {question, answer}):\n${JSON.stringify(
    normalizedHistory,
    null,
    2
  )}\n\nCandidate latest spoken answer transcript:\n${normalizedTranscript}\n\nOutput Rules (STRICT):\n- Use concise technical language.\n- No motivational content.\n- No generic explanations.\n- Focus only on actionable feedback tied to the transcript.\n- Prefer bullet points.\n\nReturn JSON with:\n- nextQuestion (string)\n- feedbackSummary (string, 3-6 sentences)\n- detailedFeedback (string, headings + bullet points; no paragraph longer than 3 lines)\n- confidenceScore (0-100)\n- technicalAccuracyScore (0-100)\n- clarityScore (0-100)\n- communicationScore (0-100)\n- strengths (string[], 3-8)\n- improvementTips (string[], 6-14)\n- detectedFillers (string[])\n- suggestedRewrite (string, improved answer using STAR/structured format, <= 180 words)\n- nextPracticePrompt (string, 1 micro-exercise)\n\nEdge Cases:\n- If transcript is short/vague, explicitly list the missing info and ask a sharper follow-up question.\n`;

  try {
    const result = await agenticGenerate({ system, user, schema: VoiceResultSchema });
    await setCachedResponse({
      key,
      feature: "voice-interview",
      provider: "ai",
      model: String(process.env.AI_PROVIDER || ""),
      response: result,
      ttlMs: Number(process.env.AI_CACHE_TTL_MS || 30 * 24 * 60 * 60 * 1000),
    });
    return { provider: "ai", ...result };
  } catch (_err) {
    return voiceInterviewFallback({ mode, history, transcript });
  }
}

module.exports = { analyzeInterviewTurn };
