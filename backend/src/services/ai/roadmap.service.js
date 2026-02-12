const { generateJson } = require("./aiClient");
const { roadmapFallback } = require("./fallback");

async function createRoadmap({ target, currentKnowledge }) {
  const system =
    "You are a senior engineering manager and career strategist. Output strictly valid JSON only.";
  const user = `Create a step-by-step roadmap for the target trajectory.\n\nTarget: ${target}\nCurrent Knowledge Base: ${currentKnowledge}\n\nReturn JSON with:\n- summary (string, 4-8 sentences)\n- milestones (array of { timeframe: string, goals: string[], resources: string[], projects: string[] })\n- skillPriorityOrder (string[])\n- nextActions (string[], 5-10, immediate steps for the next 7 days)\n- commonPitfalls (string[], 4-10)\n\nMake it realistic, specific, and measurable (deliverables, weekly cadence).`;

  try {
    const result = await generateJson({ system, user });
    return { provider: "ai", ...result };
  } catch (_err) {
    return roadmapFallback(target, currentKnowledge);
  }
}

module.exports = { createRoadmap };
