const { evaluateResume } = require("../services/ai/resume.service");
const { createRoadmap } = require("../services/ai/roadmap.service");
const { analyzeInterviewTurn } = require("../services/ai/voiceInterview.service");
const {
  analyzeResume,
  mockInterviewQuestion,
  generateCareerRoadmap,
  explainCodeLogic,
  debugCode,
} = require("../services/ai/commandCenter.service");

async function resumeEval(req, res) {
  const { resumeText } = req.validated.body;
  const result = await evaluateResume({ resumeText });
  return res.json(result);
}

async function roadmap(req, res) {
  const { target, currentKnowledge } = req.validated.body;
  const result = await createRoadmap({ target, currentKnowledge });
  return res.json(result);
}

async function voiceInterview(req, res) {
  const { mode, history, transcript } = req.validated.body;
  const result = await analyzeInterviewTurn({ mode, history, transcript });
  return res.json(result);
}

async function resumeAnalyze(req, res) {
  const { resumeText, category } = req.validated.body;
  const result = await analyzeResume({ resumeText, category });
  return res.json(result);
}

async function mockQuestion(req, res) {
  const { role, level, history } = req.validated.body;
  const text = await mockInterviewQuestion({ role, level, history });
  return res.json({ text });
}

async function careerRoadmap(req, res) {
  const { targetRole, currentSkills } = req.validated.body;
  const result = await generateCareerRoadmap({ targetRole, currentSkills });
  return res.json(result);
}

async function explainCode(req, res) {
  const { problem, code } = req.validated.body;
  const text = await explainCodeLogic({ problem, code });
  return res.json({ text });
}

async function debug(req, res) {
  const { problem, description, code } = req.validated.body;
  const text = await debugCode({ problem, description, code });
  return res.json({ text });
}

module.exports = {
  resumeEval,
  roadmap,
  voiceInterview,
  resumeAnalyze,
  mockQuestion,
  careerRoadmap,
  explainCode,
  debug,
};
