const { generateJson } = require("./aiClient");
const { voiceInterviewFallback } = require("./fallback");

async function analyzeInterviewTurn({ mode, history, transcript }) {
  const system =
    "You are a world-class interview coach. Output strictly valid JSON only.";
  const user = `We are running a mock interview.\nMode: ${mode}\n\nConversation History (array of {question, answer}):\n${JSON.stringify(
    history || [],
    null,
    2
  )}\n\nCandidate latest spoken answer transcript:\n${transcript}\n\nReturn JSON with:\n- nextQuestion (string)\n- feedbackSummary (string, 2-4 sentences)\n- detailedFeedback (string, 2-6 short paragraphs with headings like \"What worked\", \"What to fix\", \"How to structure\")\n- confidenceScore (0-100)\n- technicalAccuracyScore (0-100)\n- clarityScore (0-100)\n- communicationScore (0-100)\n- strengths (string[], 2-6)\n- improvementTips (string[], 5-12)\n- detectedFillers (string[])\n- suggestedRewrite (string, improved answer using STAR/structured format, keep under 180 words)\n- nextPracticePrompt (string, a micro-exercise for the candidate)\n\nRules:\n- Be specific to the transcript.\n- If transcript is short/vague, say what info is missing.\n`;

  try {
    const result = await generateJson({ system, user });
    return { provider: "ai", ...result };
  } catch (_err) {
    return voiceInterviewFallback({ mode, history, transcript });
  }
}

module.exports = { analyzeInterviewTurn };
