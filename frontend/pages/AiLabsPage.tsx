import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorkerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min?url';
import {
  InterviewMode,
  InterviewTurn,
  ResumeEvalResult,
  RoadmapResult,
  VoiceInterviewResult,
  resumeEval,
  roadmap,
  voiceInterview,
} from '../services/aiLabsService';

export const AiLabsPage: React.FC = () => {
  const nav = useNavigate();
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);

  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUploadLoading, setResumeUploadLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState<ResumeEvalResult | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const [target, setTarget] = useState('');
  const [currentKnowledge, setCurrentKnowledge] = useState('');
  const [roadmapResult, setRoadmapResult] = useState<RoadmapResult | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const [mode, setMode] = useState<InterviewMode>('HR');
  const [question, setQuestion] = useState('Tell me about yourself and your strongest technical skill.');
  const [history, setHistory] = useState<InterviewTurn[]>([]);
  const [lastFeedback, setLastFeedback] = useState<VoiceInterviewResult | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const transcriptRef = useRef('');
  const liveTranscriptRef = useRef('');
  const [answerDraft, setAnswerDraft] = useState('');
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const submitOnEndRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  const title = useMemo(() => 'AI Labs', []);

  const requireLogin = () => nav(`/auth?returnTo=${encodeURIComponent('/ai-labs')}`);

  const extractTextFromPdf = async (file: File) => {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    const buf = await file.arrayBuffer();
    let doc: any;
    try {
      doc = await (pdfjsLib as any).getDocument({ data: buf }).promise;
    } catch {
      doc = await (pdfjsLib as any).getDocument({ data: buf, disableWorker: true }).promise;
    }
    const maxPages = Math.min(doc.numPages || 1, 10);
    let text = '';
    for (let i = 1; i <= maxPages; i++) {
      // eslint-disable-next-line no-await-in-loop
      const page = await doc.getPage(i);
      // eslint-disable-next-line no-await-in-loop
      const content = await page.getTextContent();
      const parts = (content?.items || []).map((it: any) => String(it?.str || '')).filter(Boolean);
      text += `${parts.join(' ')}\n`;
    }
    return text.trim();
  };

  const handleResumeFile = async (file: File | null) => {
    if (!file) return;
    setResumeUploadLoading(true);
    setResumeFileName(file.name);
    setResumeResult(null);
    try {
      const isPdf = String(file.type || '').toLowerCase().includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const isText = String(file.type || '').toLowerCase().includes('text') || /\.(txt|md)$/i.test(file.name);
      let extracted = '';
      if (isPdf) extracted = await extractTextFromPdf(file);
      else if (isText) extracted = String(await file.text());
      else extracted = String(await file.text());

      const cleaned = extracted.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      if (!cleaned) {
        window.alert('Could not extract readable text from this file. Try a text-based PDF or paste your resume text.');
        return;
      }
      setResumeText(cleaned);
    } catch (e: any) {
      window.alert(e?.message || 'Failed to read resume file. Try a .pdf or paste text.');
    } finally {
      setResumeUploadLoading(false);
    }
  };

  const handleResume = async () => {
    if (!isLoggedIn) return requireLogin();
    setResumeLoading(true);
    try {
      const r = await resumeEval(resumeText);
      setResumeResult(r);
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Resume analysis failed');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleRoadmap = async () => {
    if (!isLoggedIn) return requireLogin();
    setRoadmapLoading(true);
    try {
      const r = await roadmap(target, currentKnowledge);
      setRoadmapResult(r);
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Roadmap generation failed');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const ensureSpeechApi = () => {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.continuous = true;
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;
    }
    return recognitionRef.current;
  };

  const clearVoiceTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startedAtRef.current = null;
    setSecondsLeft(null);
  };

  const stopListening = ({ submit } = { submit: false }) => {
    submitOnEndRef.current = Boolean(submit);
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    }
    clearVoiceTimer();
    setListening(false);
  };

  const resetInterview = () => {
    try {
      recognitionRef.current?.abort?.();
    } catch {
      // ignore
    }
    clearVoiceTimer();
    setListening(false);
    transcriptRef.current = '';
    liveTranscriptRef.current = '';
    setAnswerDraft('');
    setHistory([]);
    setLastFeedback(null);
    setQuestion('Tell me about yourself and your strongest technical skill.');
  };

  const submitTranscript = async (transcript: string) => {
    if (!isLoggedIn) return requireLogin();
    setVoiceLoading(true);
    try {
      const newHistory = [...history, { question, answer: transcript }];
      const r = await voiceInterview(mode, newHistory.slice(-6), transcript);
      setHistory(newHistory);
      setLastFeedback(r);
      if (r.nextQuestion) setQuestion(r.nextQuestion);
      setAnswerDraft('');
      transcriptRef.current = '';
      liveTranscriptRef.current = '';
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Voice interview failed');
    } finally {
      setVoiceLoading(false);
    }
  };

  const startListening = () => {
    if (!isLoggedIn) return requireLogin();
    const rec = ensureSpeechApi();
    if (!rec) {
      setSpeechSupported(false);
      window.alert('Speech Recognition not supported in this browser. Use Chrome.');
      return;
    }
    setSpeechSupported(true);

    transcriptRef.current = '';
    liveTranscriptRef.current = '';
    setAnswerDraft('');
    submitOnEndRef.current = true;
    startedAtRef.current = Date.now();
    setSecondsLeft(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const startedAt = startedAtRef.current || Date.now();
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, 60 - elapsedSec);
      setSecondsLeft(left);
      if (left <= 0) {
        const t = transcriptRef.current.trim();
        submitOnEndRef.current = false;
        stopListening({ submit: false });
        if (t.length >= 2) void submitTranscript(t);
      }
    }, 250);

    setListening(true);
    rec.onresult = (event: any) => {
      const results = event?.results;
      if (!results) return;
      let full = '';
      for (let i = 0; i < results.length; i += 1) full += (results[i]?.[0]?.transcript || '') + ' ';
      const cleaned = full.trim();
      if (cleaned) {
        transcriptRef.current = cleaned;
        liveTranscriptRef.current = cleaned;
        setAnswerDraft(cleaned);
      }
    };
    rec.onerror = () => stopListening({ submit: false });
    rec.onend = async () => {
      const transcript = transcriptRef.current.trim();
      const shouldSubmit = submitOnEndRef.current;
      clearVoiceTimer();
      submitOnEndRef.current = false;
      setListening(false);
      if (shouldSubmit && transcript.length >= 2) setAnswerDraft(transcript);
    };
    try {
      rec.start();
    } catch {
      submitOnEndRef.current = false;
      clearVoiceTimer();
      setListening(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Tools • Public</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{title}</h1>
          <p className="text-slate-400 mt-4 font-medium max-w-2xl">
            AI Labs are not paywalled. Sign in to use them (so we can protect API keys and rate-limit responsibly).
          </p>
          {!isLoggedIn && (
            <button
              onClick={requireLogin}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              Sign In to Use AI Labs
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="glass-card rounded-[2.5rem] border-white/10 p-6 sm:p-8 lg:col-span-1">
            <h2 className="text-2xl font-black text-white tracking-tight mb-6">Resume Evaluator</h2>
            <div className="flex items-center justify-between gap-4 mb-4">
              <label className="bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 cursor-pointer text-center">
                Upload Resume
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={(e) => void handleResumeFile(e.target.files?.[0] || null)}
                />
              </label>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest truncate">
                {resumeUploadLoading ? 'Reading...' : resumeFileName ? resumeFileName : 'PDF/TXT'}
              </div>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-56 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Paste your resume text…"
            />
            <button
              onClick={() => void handleResume()}
              disabled={!resumeText.trim() || resumeLoading}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              {resumeLoading ? 'Analyzing…' : 'Analyze Resume'}
            </button>
            {resumeResult && (
              <div className="mt-6 bg-slate-950/60 border border-white/10 rounded-2xl p-5">
                <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Summary</p>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">{resumeResult.summary || '—'}</p>
                <div className="grid grid-cols-2 gap-3 mt-4 text-slate-300 text-sm font-medium">
                  <div>
                    ATS Score: <span className="text-white font-black">{resumeResult.atsCompatibility ?? '—'}</span>
                  </div>
                  <div>
                    Strength: <span className="text-white font-black">{resumeResult.resumeStrengthScore ?? '—'}</span>
                  </div>
                  <div>
                    Verdict: <span className="text-white font-black">{resumeResult.verdict ?? '—'}</span>
                  </div>
                  <div>
                    Industry: <span className="text-white font-black">{resumeResult.industryAlignment ?? '—'}</span>
                  </div>
                </div>

                {!!resumeResult.atsBreakdown && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">ATS Breakdown</p>
                    <div className="grid grid-cols-2 gap-3 text-slate-300 text-xs font-medium">
                      <div>
                        Formatting: <span className="text-white font-black">{resumeResult.atsBreakdown.formatting ?? '-'}</span>
                      </div>
                      <div>
                        Keywords: <span className="text-white font-black">{resumeResult.atsBreakdown.keywords ?? '-'}</span>
                      </div>
                      <div>
                        Structure: <span className="text-white font-black">{resumeResult.atsBreakdown.structure ?? '-'}</span>
                      </div>
                      <div>
                        Impact: <span className="text-white font-black">{resumeResult.atsBreakdown.experienceImpact ?? '-'}</span>
                      </div>
                      <div>
                        Skills: <span className="text-white font-black">{resumeResult.atsBreakdown.skills ?? '-'}</span>
                      </div>
                      <div>
                        Education: <span className="text-white font-black">{resumeResult.atsBreakdown.education ?? '-'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!!(resumeResult.topStrengths || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Top Strengths</p>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      {(resumeResult.topStrengths || []).slice(0, 6).join(' • ')}
                    </p>
                  </div>
                )}

                {!!(resumeResult.skillGaps || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Skill Gaps</p>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      {(resumeResult.skillGaps || []).slice(0, 6).join(' • ')}
                    </p>
                  </div>
                )}
                {!!(resumeResult.improvementSuggestions || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Improvements (Actionable)</p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs font-medium leading-relaxed">
                      {(resumeResult.improvementSuggestions || []).slice(0, 10).map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!!(resumeResult.rewriteExamples || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Rewrite Examples</p>
                    <div className="space-y-3">
                      {(resumeResult.rewriteExamples || []).slice(0, 3).map((ex, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Before</p>
                          <p className="text-slate-300 text-xs font-medium mt-1 whitespace-pre-line">{ex.before}</p>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-3">After</p>
                          <p className="text-white text-xs font-medium mt-1 whitespace-pre-line">{ex.after}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!!(resumeResult.keywordTargets || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Keyword Targets</p>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      {(resumeResult.keywordTargets || []).slice(0, 14).join(' • ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-card rounded-[2.5rem] border-white/10 p-6 sm:p-8 lg:col-span-1">
            <h2 className="text-2xl font-black text-white tracking-tight mb-6">Voice-AI Mock Interview</h2>
            <div className="space-y-4">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-black uppercase tracking-widest text-xs"
              >
                <option value="HR">HR</option>
                <option value="DSA">DSA</option>
                <option value="SYSTEM_DESIGN">System Design</option>
              </select>
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
                <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Current Question</p>
                <p className="text-white font-bold">{question}</p>
              </div>
              <textarea
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                className="w-full h-28 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Type your answer here (or record it below)."
              />
              {speechSupported === false && (
                <p className="text-slate-400 text-xs font-medium">
                  Speech Recognition isn't available in this browser. Type your answer and submit.
                </p>
              )}
              <button
                onClick={() => (listening ? stopListening({ submit: true }) : startListening())}
                disabled={voiceLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                {voiceLoading ? 'Processing…' : listening ? 'Stop' : 'Start Mock Interview'}
              </button>
              <button
                onClick={() => void submitTranscript(String(answerDraft || '').trim())}
                disabled={voiceLoading || !String(answerDraft || '').trim()}
                className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all active:scale-95"
              >
                Submit Answer
              </button>
              <button
                onClick={resetInterview}
                disabled={voiceLoading}
                className="w-full bg-transparent hover:bg-white/5 disabled:opacity-50 text-slate-200 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all active:scale-95"
              >
                Reset Interview
              </button>
              {listening && (
                <p className="text-slate-400 text-xs font-medium">
                  Recording (Speech Recognition) • auto-stops at 60s • {secondsLeft ?? '—'}s left
                </p>
              )}
              {lastFeedback && (
                <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
                  <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Feedback</p>
                  <p className="text-slate-300 text-sm font-medium leading-relaxed">{lastFeedback.feedbackSummary || '—'}</p>
                  {!!lastFeedback.detailedFeedback && (
                    <p className="mt-3 text-slate-300 text-xs font-medium leading-relaxed whitespace-pre-line">
                      {lastFeedback.detailedFeedback}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 mt-4 text-slate-300 text-sm font-medium">
                    <div>
                      Confidence: <span className="text-white font-black">{lastFeedback.confidenceScore ?? '—'}</span>
                    </div>
                    <div>
                      Tech Accuracy: <span className="text-white font-black">{lastFeedback.technicalAccuracyScore ?? '—'}</span>
                    </div>
                    <div>
                      Clarity: <span className="text-white font-black">{lastFeedback.clarityScore ?? '—'}</span>
                    </div>
                    <div>
                      Communication: <span className="text-white font-black">{lastFeedback.communicationScore ?? '—'}</span>
                    </div>
                  </div>
                  {!!(lastFeedback.strengths || []).length && (
                    <p className="mt-4 text-slate-300 text-xs font-medium leading-relaxed">
                      <span className="text-white font-black">Strengths:</span> {(lastFeedback.strengths || []).slice(0, 6).join(' • ')}
                    </p>
                  )}
                  {!!(lastFeedback.improvementTips || []).length && (
                    <p className="mt-2 text-slate-400 text-xs font-medium leading-relaxed">
                      <span className="text-white font-black">Tips:</span> {(lastFeedback.improvementTips || []).slice(0, 6).join(' • ')}
                    </p>
                  )}
                  {!!lastFeedback.suggestedRewrite && (
                    <p className="mt-4 text-slate-300 text-xs font-medium leading-relaxed">
                      <span className="text-white font-black">Suggested Rewrite:</span> {lastFeedback.suggestedRewrite}
                    </p>
                  )}
                  {!!lastFeedback.nextPracticePrompt && (
                    <p className="mt-2 text-slate-400 text-xs font-medium leading-relaxed">
                      <span className="text-white font-black">Next Practice:</span> {lastFeedback.nextPracticePrompt}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] border-white/10 p-6 sm:p-8 lg:col-span-1">
            <h2 className="text-2xl font-black text-white tracking-tight mb-6">Roadmap Creator</h2>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium"
              placeholder="Trajectory target (e.g., SDE, Data Analyst)"
            />
            <textarea
              value={currentKnowledge}
              onChange={(e) => setCurrentKnowledge(e.target.value)}
              className="mt-4 w-full h-40 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-white font-medium"
              placeholder="Current knowledge base..."
            />
            <button
              onClick={() => void handleRoadmap()}
              disabled={roadmapLoading || !target.trim() || !currentKnowledge.trim()}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              {roadmapLoading ? 'Generating...' : 'Generate Roadmap'}
            </button>
            {roadmapResult && (
              <div className="mt-6 bg-slate-950/60 border border-white/10 rounded-2xl p-5">
                <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Roadmap</p>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">{roadmapResult.summary || '—'}</p>
                {!!(roadmapResult.phases || []).length && (
                  <div className="mt-5">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">6-Phase Breakdown</p>
                    <div className="space-y-4">
                      {(roadmapResult.phases || []).slice(0, 6).map((p) => (
                        <div key={p.phase} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                          <p className="text-white font-black text-sm">
                            {p.phase}. {p.title}
                          </p>
                          <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-300 text-xs font-medium leading-relaxed">
                            <li>
                              <span className="text-slate-400 font-black">Objective:</span> {p.objective}
                            </li>
                            <li>
                              <span className="text-slate-400 font-black">Tools/Tech:</span> {p.toolsTechnologies}
                            </li>
                            <li>
                              <span className="text-slate-400 font-black">Implementation:</span> {p.implementationSteps}
                            </li>
                            <li>
                              <span className="text-slate-400 font-black">Outcome:</span> {p.expectedOutcome}
                            </li>
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!!(roadmapResult.prerequisites || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Prerequisites</p>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      {(roadmapResult.prerequisites || []).slice(0, 10).join(' • ')}
                    </p>
                  </div>
                )}

                {!!(roadmapResult.targetStack || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Target Stack</p>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      {(roadmapResult.targetStack || []).slice(0, 12).join(' • ')}
                    </p>
                  </div>
                )}

                {!!(roadmapResult.skillPriorityOrder || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Skill Priority</p>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      {(roadmapResult.skillPriorityOrder || []).slice(0, 6).join(' • ')}
                    </p>
                  </div>
                )}

                {!!(roadmapResult.projects || []).length && (
                  <div className="mt-5">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Projects (Suggested)</p>
                    <div className="space-y-3">
                      {(roadmapResult.projects || []).slice(0, 3).map((p, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                          <p className="text-white font-black text-xs">{p.name}</p>
                          <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">{p.description}</p>
                          {!!(p.stack || []).length && (
                            <p className="text-slate-300 text-[11px] font-black uppercase tracking-widest mt-3">
                              Stack: <span className="text-slate-400 font-black normal-case tracking-normal">{(p.stack || []).slice(0, 10).join(', ')}</span>
                            </p>
                          )}
                          {!!(p.acceptanceCriteria || []).length && (
                            <ul className="mt-3 list-disc pl-5 space-y-1 text-slate-300 text-xs font-medium leading-relaxed">
                              {(p.acceptanceCriteria || []).slice(0, 5).map((a, j) => (
                                <li key={j}>{a}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Number.isFinite(Number((roadmapResult.studySystem as any)?.hoursPerWeek)) && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Study System</p>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      Hours/week: <span className="text-white font-black">{String((roadmapResult.studySystem as any)?.hoursPerWeek)}</span>
                    </p>
                  </div>
                )}

                {!!(roadmapResult.weeklyPlan || []).length && (
                  <div className="mt-5">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Weeks 1-3 Preview</p>
                    {(roadmapResult.weeklyPlan || []).slice(0, 3).map((w, idx) => (
                      <div key={idx} className="mt-3">
                        <p className="text-white font-black text-xs">Week {w.week}</p>
                        <p className="text-slate-400 text-xs font-medium mt-1">{(w.deliverables || w.goals || []).slice(0, 4).join(' • ')}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!!(roadmapResult.monthlyPlan || []).length && (
                  <div className="mt-5">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Monthly Preview</p>
                    {(roadmapResult.monthlyPlan || []).slice(0, 3).map((m, idx) => (
                      <div key={idx} className="mt-3">
                        <p className="text-white font-black text-xs">{m.month}</p>
                        <p className="text-slate-400 text-xs font-medium mt-1">{(m.projects || m.goals || []).slice(0, 4).join(' • ')}</p>
                      </div>
                    ))}
                  </div>
                )}

                {(roadmapResult.milestones || []).slice(0, 3).map((m, i) => (
                  <div key={i} className="mt-4">
                    <p className="text-white font-black text-sm">{m.timeframe}</p>
                    <p className="text-slate-400 text-xs font-medium mt-1">{(m.goals || []).slice(0, 4).join(' • ')}</p>
                  </div>
                ))}
                {!!(roadmapResult.nextActions || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Next 7 Days</p>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      {(roadmapResult.nextActions || []).slice(0, 8).join(' • ')}
                    </p>
                  </div>
                )}
                {!!(roadmapResult.commonPitfalls || []).length && (
                  <div className="mt-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Common Pitfalls</p>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                      {(roadmapResult.commonPitfalls || []).slice(0, 8).join(' • ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
