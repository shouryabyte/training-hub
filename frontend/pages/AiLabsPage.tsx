import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const submitOnEndRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  const title = useMemo(() => 'AI Labs', []);

  const requireLogin = () => nav(`/auth?returnTo=${encodeURIComponent('/ai-labs')}`);

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

  const submitTranscript = async (transcript: string) => {
    if (!isLoggedIn) return requireLogin();
    setVoiceLoading(true);
    try {
      const newHistory = [...history, { question, answer: transcript }];
      const r = await voiceInterview(mode, newHistory.slice(-6), transcript);
      setHistory(newHistory);
      setLastFeedback(r);
      if (r.nextQuestion) setQuestion(r.nextQuestion);
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
      window.alert('Speech Recognition not supported in this browser. Use Chrome.');
      return;
    }

    transcriptRef.current = '';
    submitOnEndRef.current = true;
    startedAtRef.current = Date.now();
    setSecondsLeft(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const startedAt = startedAtRef.current || Date.now();
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, 60 - elapsedSec);
      setSecondsLeft(left);
      if (left <= 0) stopListening({ submit: true });
    }, 250);

    setListening(true);
    rec.onresult = (event: any) => {
      const results = event?.results;
      if (!results) return;
      let full = '';
      for (let i = 0; i < results.length; i += 1) full += (results[i]?.[0]?.transcript || '') + ' ';
      if (full.trim()) transcriptRef.current = full.trim();
    };
    rec.onerror = () => stopListening({ submit: false });
    rec.onend = async () => {
      const transcript = transcriptRef.current.trim();
      const shouldSubmit = submitOnEndRef.current;
      clearVoiceTimer();
      submitOnEndRef.current = false;
      setListening(false);
      if (shouldSubmit && transcript.length >= 2) await submitTranscript(transcript);
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
    <div className="px-6 pb-20">
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

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
            <h2 className="text-2xl font-black text-white tracking-tight mb-6">Resume Evaluator</h2>
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
              </div>
            )}
          </div>

          <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
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
              <button
                onClick={() => (listening ? stopListening({ submit: true }) : startListening())}
                disabled={voiceLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                {voiceLoading ? 'Processing…' : listening ? 'Stop' : 'Start Mock Interview'}
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

          <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
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
              placeholder="Current knowledge base…"
            />
            <button
              onClick={() => void handleRoadmap()}
              disabled={roadmapLoading || !target.trim() || !currentKnowledge.trim()}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              {roadmapLoading ? 'Generating…' : 'Generate Roadmap'}
            </button>
            {roadmapResult && (
              <div className="mt-6 bg-slate-950/60 border border-white/10 rounded-2xl p-5">
                <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Roadmap</p>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">{roadmapResult.summary || '—'}</p>
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
