const { generateJson, generateText } = require("./aiClient");
const { resumeAnalyzeFallback, roadmapFallback } = require("./fallback");

async function analyzeResume({ resumeText, category }) {
  const system =
    "You are a professional career coach and hiring manager. Output strictly valid JSON only.";
  const user = `Analyze this resume for a ${category} student.\nResume Text:\n${resumeText}\n\nReturn JSON with properties:\n- feedback (string)\n- suggestions (string[])\n- score (0-100)\n`;
  try {
    const result = await generateJson({ system, user });
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
  const system =
    "You are a senior career strategist. Output strictly valid JSON only.";
  const user = `Generate a 6-month career roadmap for a student aiming to become a ${targetRole}.\nCurrent skills: ${currentSkills}\n\nReturn JSON array of objects, each with:\n- month (string)\n- milestone (string)\n- tasks (string[])\n`;
  try {
    const result = await generateJson({ system, user });
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
