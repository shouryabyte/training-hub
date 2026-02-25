const { generateJson } = require("./aiClient");
const { resumeEvalFallback } = require("./fallback");
const { cacheKey, getCachedResponse, setCachedResponse, normalizeText } = require("../../utils/aiCache");

async function evaluateResume({ resumeText }) {
  const normalized = normalizeText(resumeText);
  const version = "resume-eval:v3";
  const key = cacheKey({ feature: "resume-eval", version, parts: [normalized] });
  const cached = await getCachedResponse({ key });
  if (cached?.response) return { provider: cached.provider || "cache", ...cached.response };

  const system =
    "You are an elite career coach and ATS optimization expert. Output strictly valid JSON only.";
  const user = `Analyze the following raw resume text. Provide a detailed, ATS-focused evaluation that helps a real job-seeker improve.\n\nResume:\n${normalized}\n\nReturn JSON with keys:\n- summary (string, 6-10 sentences, specific and actionable)\n- verdict (string, one of: \"Strong\", \"Needs Work\", \"Weak\")\n- resumeStrengthScore (0-100)\n- atsCompatibility (0-100)\n- atsBreakdown (object with 0-100 scores: formatting, keywords, structure, experienceImpact, skills, education)\n- topStrengths (string[], 3-8)\n- skillGaps (string[], 4-10)\n- improvementSuggestions (string[], 8-14, concrete bullets)\n- rewriteExamples (array of { before: string, after: string } with 3-5 items)\n- industryAlignment (string)\n- keywordTargets (string[], 8-15; ATS keyword clusters to add based on resume intent)\n- sectionDiagnostics (object with keys formatting, experience, projects, skills, education;\n  each value: { status (\"OK\"|\"WEAK\"|\"MISSING\"), issues (string[], max 5), fixes (string[], max 6) })\n\nRules:\n- Be deterministic: for the same input, return the same scores and suggestions.\n- If a section is missing, say so explicitly in summary, diagnostics, and gaps.\n- Do not hallucinate companies, roles, degrees, or achievements; infer only from provided text.\n- Keep suggestions ATS-safe (simple headings, no tables/images, no graphics).\n- Prefer measurable impact: convert vague bullets into quantifiable outcomes where possible.`;

  try {
    const result = await generateJson({ system, user, temperature: 0 });
    await setCachedResponse({
      key,
      feature: "resume-eval",
      provider: "ai",
      model: String(process.env.AI_PROVIDER || ""),
      response: result,
      ttlMs: Number(process.env.AI_CACHE_TTL_MS || 30 * 24 * 60 * 60 * 1000),
    });
    return { provider: "ai", ...result };
  } catch (_err) {
    const base = resumeEvalFallback(resumeText);
    return {
      ...base,
      summary:
        base.summary ||
        `ATS snapshot: ${base.atsCompatibility}/100. Overall resume strength: ${base.resumeStrengthScore}/100. Improve section structure, add measurable impact, and align keywords to the target role.`,
      verdict: base.verdict || (base.resumeStrengthScore >= 75 ? "Strong" : base.resumeStrengthScore >= 55 ? "Needs Work" : "Weak"),
      atsBreakdown: base.atsBreakdown || {
        formatting: base.atsCompatibility,
        keywords: base.atsCompatibility,
        structure: base.atsCompatibility,
        experienceImpact: base.resumeStrengthScore,
        skills: base.resumeStrengthScore,
        education: base.atsCompatibility,
      },
      topStrengths: base.topStrengths || [],
      rewriteExamples: base.rewriteExamples || [],
    };
  }
}

module.exports = { evaluateResume };
