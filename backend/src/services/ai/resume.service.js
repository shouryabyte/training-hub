const { generateJson } = require("./aiClient");
const { resumeEvalFallback } = require("./fallback");

async function evaluateResume({ resumeText }) {
  const system =
    "You are an elite career coach and ATS optimization expert. Output strictly valid JSON only.";
  const user = `Analyze the following raw resume text. Provide a descriptive, ATS-focused evaluation.\n\nResume:\n${resumeText}\n\nReturn JSON with keys:\n- summary (string, 4-8 sentences, specific and actionable)\n- verdict (string, one of: \"Strong\", \"Needs Work\", \"Weak\")\n- resumeStrengthScore (0-100)\n- atsCompatibility (0-100)\n- atsBreakdown (object with 0-100 scores: formatting, keywords, structure, experienceImpact, skills, education)\n- topStrengths (string[], 3-7)\n- skillGaps (string[], 3-8)\n- improvementSuggestions (string[], 5-12, concrete bullets)\n- rewriteExamples (array of { before: string, after: string } with 2-4 items)\n- industryAlignment (string)\n\nRules:\n- If a section is missing, say so explicitly in summary and gaps.\n- Do not hallucinate companies or degrees; infer only from provided text.\n- Keep suggestions ATS-safe (simple headings, no tables/images).`;

  try {
    const result = await generateJson({ system, user });
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
