
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeResume, generateCareerRoadmap } from '../services/aiService';
import { Category } from '../types';

export const AICoach: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resume' | 'interview' | 'roadmap'>('resume');
  const [loading, setLoading] = useState(false);
  
  // Voice Interview State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [interviewRole, setInterviewRole] = useState('Full Stack Engineer');
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));

  // Resume Audit State
  const [resumeText, setResumeText] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  
  // Roadmap State
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [roadmap, setRoadmap] = useState<any[]>([]);

  // Audio Visualizer Loop
  useEffect(() => {
    let animationId: number;
    const update = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioData(dataArray);
      }
      animationId = requestAnimationFrame(update);
    };
    if (isVoiceActive) update();
    return () => cancelAnimationFrame(animationId);
  }, [isVoiceActive]);

  const startVoiceInterview = async () => {
    try {
      setLoading(true);

      // Voice interviews are implemented securely in the dedicated AI Labs page (backend-driven).
      navigate('/ai-labs');
      setLoading(false);
    } catch (error) {
      console.error('Failed to start voice interview:', error);
      setLoading(false);
    }
  };

  const stopVoiceInterview = () => {
    sessionRef.current?.close();
    setIsVoiceActive(false);
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText) return;
    setLoading(true);
    try {
      const result = await analyzeResume(resumeText, Category.COLLEGE);
      setFeedback(result);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleGenerateRoadmap = async () => {
    if (!targetRole) return;
    setLoading(true);
    try {
      const result = await generateCareerRoadmap(targetRole, currentSkills);
      setRoadmap(result);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <section id="ai-coach" className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-3xl">
            <span className="mono text-indigo-400 text-xs font-bold tracking-[0.4em] uppercase mb-6 block">Division: Neural Intelligence</span>
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">Nexchakra <br /><span className="gradient-text">AI Command Center</span></h2>
            <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl">Precision-engineered tools to benchmark, simulate, and accelerate your technical trajectory. Powered by Groq.</p>
          </div>
          <div className="flex flex-wrap bg-slate-900/60 backdrop-blur-3xl p-2 rounded-[2.5rem] border border-white/10 shadow-2xl gap-1">
            {['resume', 'interview', 'roadmap'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 sm:px-8 py-3 sm:py-4 rounded-[2rem] font-black text-[10px] sm:text-[11px] tracking-widest uppercase transition-all duration-500 flex items-center gap-3 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                {tab === 'resume' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                {tab === 'interview' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>}
                {tab === 'roadmap' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7"></path></svg>}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2.75rem] sm:rounded-[4rem] border-white/10 p-7 sm:p-10 lg:p-12 min-h-[520px] lg:min-h-[750px] shadow-[0_0_120px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path></svg>
          </div>

          {activeTab === 'resume' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 h-full flex-1">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="mono text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">INPUT AREA // RAW DATA</span>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="mono text-[9px] text-slate-500 uppercase tracking-widest">Neural Link Syncing</span>
                  </div>
                </div>
                <textarea 
                  className="flex-1 w-full bg-slate-950/60 border border-white/5 rounded-[3rem] p-10 text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 mb-10 resize-none font-medium text-lg leading-relaxed shadow-inner"
                  placeholder="Paste your raw resume text here for a deep-neural evaluation..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <button 
                  onClick={handleAnalyzeResume}
                  disabled={loading || !resumeText}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 px-14 py-6 rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase transition-all self-start shadow-[0_20px_40px_rgba(99,102,241,0.3)] active:scale-95 flex items-center gap-4"
                >
                  {loading ? (
                    <span className="flex items-center gap-3"><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Analyzing...</span>
                  ) : 'Generate Professional Audit'}
                </button>
              </div>

              <div className="flex flex-col relative">
                <div className="mb-8">
                  <span className="mono text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">OUTPUT // AUDIT INSIGHTS</span>
                </div>
                {feedback ? (
                  <div className="bg-slate-900/60 border border-white/5 rounded-[4rem] p-12 h-full animate-in fade-in slide-in-from-right-10 duration-700 shadow-2xl relative">
                    <div className="flex items-center gap-10 mb-12">
                      <div className="w-32 h-32 rounded-full border-8 border-indigo-500/10 flex items-center justify-center relative shadow-inner bg-slate-950">
                         <span className="text-5xl font-black text-white tracking-tighter tabular-nums">{feedback.score}</span>
                         <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-indigo-500" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * feedback.score / 100)} />
                         </svg>
                      </div>
                      <div>
                        <h4 className="text-4xl font-black text-white mb-2 tracking-tighter">Market Score</h4>
                        <p className="mono text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Tier 1 Industry Alignment</p>
                      </div>
                    </div>
                    
                    <div className="space-y-10 overflow-y-auto max-h-[400px] pr-4 scrollbar-hide">
                      <div className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-white/5">
                        <p className="text-slate-300 text-lg leading-relaxed font-medium italic">"{feedback.feedback}"</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {feedback.suggestions.map((s: string, i: number) => (
                          <div key={i} className="flex items-start gap-6 p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                            <span className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 text-xs font-black group-hover:scale-110 transition-transform">0{i+1}</span>
                            <span className="text-slate-400 text-base font-medium group-hover:text-slate-200 transition-colors">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-slate-600 p-16 text-center bg-slate-950/40">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 shadow-2xl animate-pulse">
                      <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <p className="text-2xl font-black text-slate-400 mb-4 tracking-tighter uppercase">Audit Engine Ready</p>
                    <p className="text-base font-medium text-slate-500 max-w-sm leading-relaxed">Evaluation will be processed instantly using our proprietary LLM recruitment model.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'interview' ? (
            <div className="flex flex-col items-center justify-center h-full flex-1">
              <div className="w-full max-w-4xl text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-10">
                   <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                   <span className="mono text-[10px] font-black text-indigo-400 uppercase tracking-widest">Neural Voice Link v2.5</span>
                </div>
                <h3 className="text-5xl font-black text-white mb-8 tracking-tighter leading-none">Voice-AI Mock Simulation</h3>
                <p className="text-slate-400 text-lg mb-16 max-w-2xl mx-auto font-medium">Practice high-pressure interviews with real-time voice feedback. The AI will analyze your confidence, technical depth, and tone.</p>

                <div className="flex flex-col items-center gap-12">
                   <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-950/60 p-4 rounded-[3rem] border border-white/5 shadow-2xl">
                      <div className="flex flex-col items-start px-8">
                         <label className="mono text-[8px] font-black uppercase text-slate-600 tracking-widest mb-1">Position Target</label>
                         <input 
                           type="text" 
                           className="bg-transparent border-none text-white font-bold text-xl focus:outline-none placeholder:text-slate-800"
                           value={interviewRole}
                           onChange={(e) => setInterviewRole(e.target.value)}
                           disabled={isVoiceActive}
                         />
                      </div>
                      <div className="h-10 w-[1px] bg-white/5 hidden md:block"></div>
                      {!isVoiceActive ? (
                        <button 
                          onClick={startVoiceInterview}
                          disabled={loading}
                          className="bg-white text-slate-950 px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                          {loading ? 'Initializing...' : 'Initialize Session'}
                        </button>
                      ) : (
                        <button 
                          onClick={stopVoiceInterview}
                          className="bg-rose-600 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-2xl active:scale-95"
                        >
                          Terminate Session
                        </button>
                      )}
                   </div>

                   {isVoiceActive && (
                     <div className="flex flex-col items-center gap-10 animate-in fade-in duration-1000">
                        <div className="flex items-center gap-2 h-24">
                           {Array.from(audioData.slice(0, 32)).map((val, i) => {
                             const n = Number(val) || 0;
                             return (
                               <div
                                 key={i}
                                 className="w-1.5 bg-indigo-500 rounded-full transition-all duration-75"
                                 style={{ height: `${Math.max(8, n / 1.5)}px`, opacity: n / 255 + 0.2 }}
                               ></div>
                             );
                           })}
                        </div>
                        <p className="mono text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Session Active: Speak Now</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 h-full flex-1">
               <div className="flex flex-col">
                  <span className="mono text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-10">CALIBRATION // PARAMETERS</span>
                  <div className="space-y-10">
                     <div className="space-y-4">
                        <label className="mono text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Trajectory Target</label>
                        <input 
                          type="text" 
                          placeholder="e.g. AI Research Engineer at Google"
                          className="w-full bg-slate-950/60 border border-white/5 rounded-[2.5rem] p-5 sm:p-8 text-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none font-bold text-base sm:text-lg shadow-inner"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="mono text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Current Knowledge Base</label>
                        <textarea 
                          placeholder="List your primary languages, tools, and experience level..."
                          className="w-full bg-slate-950/60 border border-white/5 rounded-[2.5rem] p-5 sm:p-8 text-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none font-bold text-base sm:text-lg h-40 sm:h-48 resize-none shadow-inner"
                          value={currentSkills}
                          onChange={(e) => setCurrentSkills(e.target.value)}
                        />
                     </div>
                     <button 
                        onClick={handleGenerateRoadmap}
                        disabled={loading || !targetRole}
                        className="w-full bg-white text-slate-950 py-6 rounded-[2.5rem] font-black text-xs tracking-[0.2em] uppercase hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
                     >
                        {loading ? 'Synthesizing Path...' : 'Generate 6-Month Neural Roadmap'}
                     </button>
                  </div>
               </div>

               <div className="flex flex-col">
                  <span className="mono text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-10">OUTPUT // PREDICTED TRAJECTORY</span>
                  <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-[4rem] p-12 overflow-y-auto space-y-12 max-h-[550px] scrollbar-hide shadow-2xl">
                    {roadmap.length > 0 ? (
                      roadmap.map((step, i) => (
                        <div key={i} className="relative pl-14 border-l-4 border-indigo-500/20 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: `${i * 150}ms` }}>
                          <div className="absolute top-0 left-[-11px] w-5 h-5 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] border-4 border-slate-900"></div>
                          <h5 className="text-white font-black text-3xl mb-2 tracking-tighter">{step.month}</h5>
                          <p className="mono text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">{step.milestone}</p>
                          <div className="grid grid-cols-1 gap-3">
                            {step.tasks.map((task: string, j: number) => (
                              <div key={j} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 text-sm font-semibold hover:bg-white/[0.05] transition-all">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                                {task}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-800 text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 opacity-20">
                           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7"></path></svg>
                        </div>
                        <p className="text-2xl font-black uppercase tracking-tighter">No Roadmap Active</p>
                        <p className="mono text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Define targets to synthesize path</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
