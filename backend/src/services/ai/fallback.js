function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function countMatches(text, words) {
  const t = String(text || "").toLowerCase();
  let count = 0;
  for (const w of words) if (t.includes(w)) count += 1;
  return count;
}

function resumeEvalFallback(resumeText) {
  const keywords = [
    "experience",
    "projects",
    "skills",
    "education",
    "achievement",
    "intern",
    "developer",
    "engineer",
    "node",
    "react",
    "mongodb",
    "sql",
    "aws",
    "docker",
    "kubernetes",
  ];
  const hits = countMatches(resumeText, keywords);
  const length = String(resumeText || "").length;

  const resumeStrengthScore = clamp(Math.round(35 + hits * 4 + Math.min(length / 400, 20)), 0, 100);
  const atsCompatibility = clamp(Math.round(40 + hits * 3 + Math.min(length / 500, 15)), 0, 100);

  const skillGaps = [];
  if (!String(resumeText).toLowerCase().includes("project")) skillGaps.push("Project impact statements");
  if (!String(resumeText).toLowerCase().includes("metric")) skillGaps.push("Quantified outcomes (metrics)");
  if (!String(resumeText).toLowerCase().includes("aws") && !String(resumeText).toLowerCase().includes("cloud"))
    skillGaps.push("Cloud fundamentals");

  const improvementSuggestions = [
    "Add quantified impact (latency, revenue, users, throughput).",
    "Use ATS-friendly headings: Experience, Projects, Skills, Education.",
    "Add 2–4 strong projects with links and measurable outcomes.",
    "Tailor keywords to the target job description.",
  ];

  return {
    provider: "fallback",
    resumeStrengthScore,
    atsCompatibility,
    summary: `ATS score ${atsCompatibility}/100. Overall resume strength ${resumeStrengthScore}/100. Add measurable impact, tighten structure, and align keywords to your target role.`,
    verdict: resumeStrengthScore >= 75 ? "Strong" : resumeStrengthScore >= 55 ? "Needs Work" : "Weak",
    atsBreakdown: {
      formatting: atsCompatibility,
      keywords: clamp(atsCompatibility - 5, 0, 100),
      structure: atsCompatibility,
      experienceImpact: resumeStrengthScore,
      skills: resumeStrengthScore,
      education: clamp(atsCompatibility + 5, 0, 100),
    },
    topStrengths: hits >= 6 ? ["Core ATS sections/keywords detected"] : ["Some relevant keywords detected"],
    skillGaps,
    improvementSuggestions,
    rewriteExamples: [
      { before: "Worked on a project.", after: "Built a project that improved X by Y% by doing Z (tech stack: ...)." },
      { before: "Responsible for backend.", after: "Owned backend APIs (Node/Express), reduced response time by 30% via caching and query optimization." },
    ],
    industryAlignment: "General Software Engineering",
  };
}

function resumeAnalyzeFallback(resumeText, category) {
  const base = resumeEvalFallback(resumeText);
  const score = clamp(base.resumeStrengthScore ?? 60, 0, 100);
  return {
    provider: "fallback",
    feedback: `Baseline analysis for a ${category} candidate. Strength score ${score}/100. Improve ATS structure and add measurable impact.`,
    suggestions: base.improvementSuggestions || [],
    score,
  };
}

function roadmapFallback(target, currentKnowledge) {
  const t = String(target || "Target role").trim();
  return {
    provider: "fallback",
    summary: `A practical 6-month plan to reach ${t}, tailored to your current baseline.`,
    milestones: [
      {
        timeframe: "Month 1",
        goals: ["Solidify fundamentals", "Set up portfolio baseline"],
        resources: ["Official docs", "NeetCode/LeetCode basics", "System design primer"],
        projects: ["Build a small REST API + auth"],
      },
      {
        timeframe: "Month 2-3",
        goals: ["Deepen core skills", "Ship a mid-sized project"],
        resources: ["Design patterns", "Testing basics", "Cloud deployment guide"],
        projects: ["Build a full-stack app with CI/CD"],
      },
      {
        timeframe: "Month 4-6",
        goals: ["Interview readiness", "Polish portfolio and resume"],
        resources: ["Mock interviews", "Behavioral STAR framework"],
        projects: ["Capstone: production-grade system with monitoring"],
      },
    ],
    skillPriorityOrder: ["DSA", "System Design", "Projects", "Communication", "Cloud"],
    nextActions: [
      "Pick 1 primary stack and set up a weekly schedule (5-7 hours).",
      "Choose one portfolio project and write a 1-page spec (features + tech).",
      "Study fundamentals for 45-60 minutes daily (DSA + core concepts).",
      "Ship a small deliverable this week (endpoint, page, deployment).",
      "Create a progress tracker (checklist + weekly review).",
    ],
    commonPitfalls: [
      "Trying to learn too many technologies at once.",
      "Building projects without measurable outcomes or demos.",
      "Skipping revision: not turning notes into practice problems.",
      "Ignoring interview practice until the very end.",
      "Inconsistent cadence (no weekly deliverables).",
    ],
    notes: currentKnowledge ? `Current knowledge considered: ${String(currentKnowledge).slice(0, 180)}...` : "",
  };
}

function pickNextQuestion(mode, historyCount) {
  const bank = {
    HR: [
      "Why do you want this role and what makes you a good fit?",
      "Tell me about a time you handled a conflict in a team.",
      "Describe a failure and what you learned from it.",
    ],
    DSA: [
      "Explain the time complexity of your approach and possible optimizations.",
      "How would you handle edge cases and constraints?",
      "Can you derive a more optimal solution using a different data structure?",
    ],
    SYSTEM_DESIGN: [
      "How would you design this for scale and reliability?",
      "What are the critical bottlenecks and how would you mitigate them?",
      "How would you handle caching, rate limits, and observability?",
    ],
  };
  const list = bank[mode] || bank.HR;
  return list[historyCount % list.length];
}

function voiceInterviewFallback({ mode, history, transcript }) {
  const text = String(transcript || "");
  const fillers = ["um", "uh", "like", "you know", "actually", "basically"];
  const detectedFillers = fillers.filter((f) => text.toLowerCase().includes(f));
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  const confidenceScore = clamp(Math.round(55 + Math.min(words / 10, 20) - detectedFillers.length * 5), 0, 100);
  const clarityScore = clamp(Math.round(50 + Math.min(words / 12, 25) - detectedFillers.length * 6), 0, 100);
  const technicalAccuracyScore = clamp(Math.round(45 + Math.min(countMatches(text, ["time", "space", "tradeoff", "edge", "complexity", "api", "db"]) * 8, 40)), 0, 100);
  const communicationScore = clamp(Math.round((confidenceScore + clarityScore) / 2), 0, 100);

  return {
    provider: "fallback",
    nextQuestion: pickNextQuestion(mode, (history || []).length),
    feedbackSummary: "Baseline voice analysis (fallback). Aim for concise structure, fewer fillers, and clearer technical reasoning.",
    detailedFeedback:
      "What worked:\\n- You provided an answer with some structure.\\n\\nWhat to fix:\\n- Add a clear problem statement and a concrete example.\\n- Reduce filler words and tighten sentences.\\n\\nHow to structure:\\n- Use context -> approach -> result, and end with a takeaway.",
    confidenceScore,
    technicalAccuracyScore,
    clarityScore,
    communicationScore,
    strengths: words >= 40 ? ["You spoke at a reasonable length"] : ["You attempted to answer the question"],
    improvementTips: [
      "Use a 3-part structure: context → approach → result.",
      "Reduce fillers by pausing silently instead.",
      "Add one concrete example or metric to support claims.",
    ],
    detectedFillers,
    suggestedRewrite:
      "Context: I worked on a project where I had to solve a clear user problem. Approach: I broke it into smaller tasks, implemented the core solution first, and validated it with tests. Result: the feature shipped reliably and improved the experience. Takeaway: I focus on clear trade-offs, measurable outcomes, and clean communication.",
    nextPracticePrompt:
      "Practice a 45-second answer using: (1) Context (1 sentence), (2) Approach (2 sentences), (3) Result + metric (1 sentence).",
  };
}

module.exports = {
  resumeEvalFallback,
  resumeAnalyzeFallback,
  roadmapFallback,
  voiceInterviewFallback,
};
