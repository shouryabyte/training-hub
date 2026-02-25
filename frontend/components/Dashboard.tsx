
import React, { useState } from 'react';
import { Category } from '../types';
import { CodeHub } from './CodeHub';

interface DashboardProps {
  onLogout: () => void;
  category: Category;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, category }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [terminalOpen, setTerminalOpen] = useState(false);

  const isSchool = category === Category.SCHOOL;
  const themeColor = isSchool ? 'emerald' : 'indigo';

  const stats = isSchool ? [
    { label: "College Bound", value: "98%", trend: "up", color: "text-emerald-400" },
    { label: "Profile Depth", value: "7.4", trend: "up", color: "text-cyan-400" },
    { label: "Study Streak", value: "14d", trend: "neutral", color: "text-amber-400" },
    { label: "Peer Rank", value: "#12", trend: "up", color: "text-rose-400" },
  ] : [
    { label: "Neural Rank", value: "#142", trend: "up", color: "text-indigo-400" },
    { label: "Skill Score", value: "842", trend: "up", color: "text-emerald-400" },
    { label: "Active Sprints", value: "3", trend: "neutral", color: "text-amber-400" },
    { label: "Collaborators", value: "12", trend: "up", color: "text-sky-400" },
  ];

  const sidebarItems = [
    { id: 'overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Mission Overview' },
    { id: 'track', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: isSchool ? 'Admissions Track' : 'Placement Track' },
    ...(!isSchool ? [{ id: 'codehub', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', label: 'Code Hub (DSA)' }] : []),
    { id: 'labs', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', label: 'AI Labs' },
    { id: 'projects', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: isSchool ? 'Profile Labs' : 'Prod Labs' },
  ];

  const activeReferrals = isSchool ? [
    { school: "Stanford", role: "Early Action", status: "SOP Review", date: "Jan 30" },
    { school: "MIT", role: "Regular", status: "Portfolio Ready", date: "Feb 15" },
    { school: "IIT Bombay", role: "JEE Track", status: "Mock Sim 4", date: "Jan 28" },
  ] : [
    { company: "Google", role: "SDE-1", status: "L3 Interview", date: "Tomorrow" },
    { company: "OpenAI", role: "ML Engineer", status: "Tech Review", date: "Jan 24" },
    { company: "Tesla", role: "Product Eng", status: "Referral Sent", date: "Jan 22" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex selection:bg-indigo-500 selection:text-white neural-bg">
      {/* Sidebar */}
      <aside className={`w-80 border-r border-white/5 bg-slate-950/40 backdrop-blur-3xl flex flex-col p-8 hidden lg:flex sticky top-0 h-screen transition-all z-20`}>
        <div className="flex items-center gap-4 mb-16 group cursor-pointer">
          <div className={`w-12 h-12 ${isSchool ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-indigo-600 shadow-indigo-600/30'} rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-2xl group-hover:scale-110 transition-all duration-700`}>N</div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-indigo-400 transition-colors">NEXCHAKRA</span>
        </div>

        <nav className="flex-1 space-y-6">
          {sidebarItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] mono text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === item.id ? (isSchool ? 'bg-emerald-600' : 'bg-indigo-600') + ' text-white shadow-2xl scale-[1.05]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-10 space-y-6">
          <div className={`${isSchool ? 'bg-emerald-900/10 border-emerald-500/10' : 'bg-indigo-900/10 border-indigo-500/10'} border rounded-[2rem] p-8 shadow-inner`}>
             <p className={`mono text-[9px] font-black ${isSchool ? 'text-emerald-400' : 'text-indigo-400'} uppercase tracking-[0.3em] mb-3`}>{isSchool ? 'Alpha Peer Group' : 'Alpha Referral'}</p>
             <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">{isSchool ? 'You have 4 premium mentor slots for university counseling.' : 'You have 2 direct elite referral slots for the Q1 2025 cohort.'}</p>
             <button className={`w-full py-3.5 ${isSchool ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'} mono text-[9px] font-black uppercase tracking-[0.3em] rounded-xl transition-all border hover:bg-opacity-20`}>Claim Access</button>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] mono text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-500/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-950 p-8 lg:p-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12 mb-12 md:mb-20">
          <div>
            <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">{isSchool ? 'Alpha Command' : 'Delta Command'}</h1>
            <div className="flex items-center gap-4">
               <span className={`flex items-center gap-2 ${isSchool ? 'text-emerald-400' : 'text-indigo-400'} mono text-[10px] font-black uppercase tracking-[0.3em]`}>
                  <span className={`w-2 h-2 ${isSchool ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-indigo-500 shadow-indigo-500/50'} rounded-full animate-pulse shadow-[0_0_12px]`}></span>
                  Biometric Link Active
               </span>
               <span className="text-slate-800 mono text-[10px] uppercase font-black">•</span>
               <p className="text-slate-500 mono text-[10px] font-black uppercase tracking-widest">Engineer #{isSchool ? 'S-9912' : 'U-7429'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex bg-slate-900 border border-white/5 p-2 rounded-[2rem] gap-2 shadow-2xl">
               <button onClick={() => setTerminalOpen(!terminalOpen)} className="w-12 h-12 rounded-2xl hover:bg-white/5 flex items-center justify-center text-slate-400 transition-all group">
                  <svg className={`w-6 h-6 group-hover:${isSchool ? 'text-emerald-400' : 'text-indigo-400'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3"></path></svg>
               </button>
               <button className="w-12 h-12 rounded-2xl hover:bg-white/5 flex items-center justify-center text-slate-400 relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
               </button>
            </div>
            <div className={`flex items-center gap-5 ${isSchool ? 'bg-emerald-600/5 border-emerald-500/10' : 'bg-indigo-600/5 border-indigo-500/10'} border p-2 pr-8 rounded-[2rem] group cursor-pointer hover:scale-[1.03] transition-all shadow-2xl`}>
               <div className={`w-12 h-12 rounded-2xl ${isSchool ? 'bg-emerald-500' : 'bg-indigo-500'} flex items-center justify-center font-black text-white text-sm shadow-2xl group-hover:scale-110 transition-transform`}>AS</div>
               <div className="hidden sm:block">
                  <p className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Alex S.</p>
                  <p className={`mono text-[9px] ${isSchool ? 'text-emerald-400' : 'text-indigo-400'} font-bold uppercase tracking-[0.2em]`}>{isSchool ? 'ALPHA FOUNDATION' : 'DELTA ACCELERATION'}</p>
               </div>
            </div>
          </div>
        </header>

        {terminalOpen && (
          <div className={`mb-16 glass-card p-10 rounded-[3rem] border-${themeColor}-500/20 bg-slate-950/80 font-mono text-sm animate-in slide-in-from-top duration-700 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]`}>
             <div className="flex items-center justify-between mb-8 px-2">
                <span className={`mono text-[10px] font-black ${isSchool ? 'text-emerald-400' : 'text-indigo-400'} uppercase tracking-[0.5em]`}>NEX-SYSTEMS-SHELL v4.0.1</span>
                <button onClick={() => setTerminalOpen(false)} className="text-slate-600 hover:text-white transition-colors text-xl">✕</button>
             </div>
             <div className="space-y-2 opacity-80">
                <p className="text-slate-600">Last login: {new Date().toLocaleString()} on nexus-core-hub</p>
                <p className={`${isSchool ? 'text-emerald-400' : 'text-indigo-400'} font-bold`}>nexchakra@admin:~$ <span className="text-slate-300">fetch --telemetry --user={isSchool ? 'S-9912' : 'U-7429'}</span></p>
                <p className="text-slate-400">Pinging satellites... OK</p>
                <p className="text-slate-400">Loading neural skill DNA... 100%</p>
                <p className="text-emerald-400">Trajectory Projection: Elite Success (99.2% confidence)</p>
                <p className={`${isSchool ? 'text-emerald-400' : 'text-indigo-400'} font-bold animate-pulse`}>nexchakra@admin:~$ <span className="bg-slate-400 w-2 h-5 inline-block align-middle"></span></p>
             </div>
          </div>
        )}

        {/* Tab-specific Views */}
        {activeTab === 'codehub' ? (
          <CodeHub />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-12 md:mb-20">
              {stats.map((stat, i) => (
                <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden group hover:translate-y-[-8px] transition-all duration-700 shadow-2xl">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:${isSchool ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} transition-all duration-1000`}></div>
                  <div className="relative z-10">
                    <p className="mono text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <span className={`text-6xl font-black ${stat.color} tracking-tighter tabular-nums`}>{stat.value}</span>
                      <div className={`flex flex-col items-end gap-2`}>
                        <span className={`mono text-[9px] font-black px-3 py-1.5 rounded-xl ${stat.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-500 bg-slate-500/10 uppercase'}`}>
                          {stat.trend === 'up' ? '↑ GAIN' : '→ STABLE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
              <div className="lg:col-span-2 space-y-16">
                {/* Progress Card */}
                <div className="glass-card p-7 sm:p-10 lg:p-14 rounded-[2.75rem] sm:rounded-[4rem] border-white/10 relative overflow-hidden shadow-2xl group/main">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                      <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path></svg>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12 mb-12 md:mb-20 relative z-10">
                      <div>
                          <span className={`${isSchool ? 'text-emerald-400' : 'text-indigo-400'} mono text-[11px] font-black uppercase tracking-[0.5em] mb-4 block`}>Phase 02 // ACCELERATION</span>
                          <h3 className="text-5xl font-black text-white tracking-tighter leading-[0.9] mb-8">{isSchool ? 'Ivy Admissions \n& SAT/JEE Master' : 'Production \nCloud Engineering'}</h3>
                          <div className="flex items-center gap-6">
                            <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-2xl mono text-[10px] font-black text-slate-400 uppercase tracking-widest">{isSchool ? 'CYCLE 2025' : 'COHORT DELTA'}</span>
                            <span className={`px-5 py-2 bg-${themeColor}-500/10 border border-${themeColor}-500/20 rounded-2xl mono text-[10px] font-black ${isSchool ? 'text-emerald-400' : 'text-indigo-400'} uppercase tracking-widest`}>GLOBAL TOP 1%</span>
                          </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                          <div className="flex items-baseline gap-2">
                            <span className="text-white text-8xl font-black tracking-tighter tabular-nums">{isSchool ? '72' : '64'}</span>
                            <span className="text-4xl font-black text-slate-700 tracking-tighter">%</span>
                          </div>
                          <p className="mono text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Neural Maturity</p>
                      </div>
                    </div>

                    <div className="h-10 w-full bg-slate-950 rounded-3xl mb-16 relative overflow-hidden border border-white/5 p-2 shadow-inner">
                      <div className={`h-full bg-gradient-to-r ${isSchool ? 'from-emerald-600 via-cyan-600 to-emerald-600' : 'from-indigo-600 via-purple-600 to-indigo-600'} w-[${isSchool ? '72%' : '64%'}] rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] relative transition-all duration-1000 ease-out`}>
                          <div className="absolute inset-0 bg-white/10 animate-pulse-slow"></div>
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                      <div className="bg-slate-950/60 p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/20 transition-all group/card shadow-inner">
                          <p className="mono text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8">{isSchool ? 'MILESTONE' : 'ACTIVE SPRINT'}</p>
                          <h4 className="text-white font-black mb-3 text-xl leading-tight group-hover/card:text-indigo-400 transition-colors">{isSchool ? 'SOP Narrative Sync' : 'K8s Cluster Opt'}</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed">{isSchool ? 'Final review due by EOD' : 'Latency optimization required'}</p>
                      </div>
                      <div className="bg-slate-950/60 p-10 rounded-[3rem] border border-white/5 hover:border-emerald-500/20 transition-all group/card shadow-inner">
                          <p className="mono text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8">{isSchool ? 'MOCK SIM' : 'NEXT PHASE'}</p>
                          <h4 className="text-white font-black mb-3 text-xl leading-tight group-hover/card:text-emerald-400 transition-colors">{isSchool ? 'Full Length JEE-M' : 'Distributed Sys'}</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed">{isSchool ? 'Scheduled for Wed, 08:00' : 'Unlocks at Neural level 15'}</p>
                      </div>
                      <div className="bg-slate-950/60 p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group/card shadow-inner">
                          <p className="mono text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8">{isSchool ? 'ACTIVITY' : 'LAB CREDITS'}</p>
                          <h4 className="text-white font-black mb-3 text-xl leading-tight group-hover/card:text-amber-400 transition-colors">{isSchool ? 'NGO Leadership' : '4 Simulations'}</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed">{isSchool ? 'Tier 1 status confirmed' : 'Voice-AI ready for use'}</p>
                      </div>
                    </div>
                </div>

                {/* Skill Tree Visualizer */}
                <div className="glass-card p-7 sm:p-10 lg:p-14 rounded-[2.75rem] sm:rounded-[4rem] border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-16">
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{isSchool ? 'Alpha Talent Tree' : 'Delta Skill Network'}</h3>
                      <div className="flex gap-4">
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-950 rounded-full border border-white/5">
                            <div className={`w-2 h-2 rounded-full ${isSchool ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                            <span className="mono text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastered</span>
                          </div>
                      </div>
                    </div>

                    <div className="relative h-[400px] flex items-center justify-center">
                      {/* Central Node */}
                      <div className={`w-28 h-28 rounded-3xl ${isSchool ? 'bg-emerald-600' : 'bg-indigo-600'} flex items-center justify-center text-white shadow-[0_0_60px_rgba(99,102,241,0.5)] z-10 transition-transform hover:scale-110 relative group`}>
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <p className="mono text-[8px] font-black text-white uppercase tracking-widest">Core Potential</p>
                          </div>
                      </div>

                      <div className="absolute w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      <div className="absolute h-[80%] w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

                      {[
                        { l: isSchool ? 'SOP Mastery' : 'Microservices', pos: 'top-0 left-1/4', c: isSchool ? 'emerald' : 'indigo' },
                        { l: isSchool ? 'JEE Mastery' : 'DevOps', pos: 'top-10 right-1/4', c: 'slate' },
                        { l: isSchool ? 'Global MUN' : 'Frontend Archi', pos: 'bottom-10 left-1/4', c: isSchool ? 'emerald' : 'indigo' },
                        { l: isSchool ? 'SAT Expert' : 'Cloud Security', pos: 'bottom-0 right-1/4', c: 'slate' },
                      ].map((node, i) => (
                        <div key={i} className={`absolute ${node.pos} w-20 h-20 rounded-2xl ${node.c === 'slate' ? 'bg-slate-900 border border-white/10 text-slate-500' : (isSchool ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400')} border flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:scale-110 transition-all`}>
                            <div className="w-2 h-2 rounded-full mb-2 bg-current opacity-40"></div>
                            <p className="mono text-[8px] font-black uppercase tracking-tighter leading-none">{node.l}</p>
                        </div>
                      ))}
                    </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-16">
                <div className={`glass-card p-7 sm:p-10 lg:p-12 rounded-[2.75rem] sm:rounded-[4rem] border-${themeColor}-500/20 bg-${themeColor}-600/5 relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] group/advisor`}>
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] group-hover/advisor:scale-150 transition-transform duration-1000"></div>
                    <div className="flex items-center gap-4 mb-12">
                      <div className={`w-12 h-12 rounded-2xl ${isSchool ? 'bg-emerald-600' : 'bg-indigo-600'} flex items-center justify-center shadow-2xl`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">AI Advisor <br/><span className="mono text-[9px] text-slate-500 tracking-[0.4em]">Neural Core</span></h3>
                    </div>
                    <div className="bg-slate-950/80 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-white/5 mb-10 sm:mb-12 relative z-10 shadow-inner">
                      <p className="text-slate-300 text-lg leading-relaxed italic font-medium">
                          {isSchool ? '"Your essay on AI Ethics is brilliant but lacks personal anecdotes. Admission officers look for empathy over logic. Revise the third paragraph with your volunteer story."' : '"Your system architecture scores are exemplary, but your latency benchmarks are 12% below standard. Focus on Redis caching for the next sprint."'}
                      </p>
                    </div>
                    <button className={`w-full py-6 rounded-[2rem] ${isSchool ? 'bg-emerald-600' : 'bg-indigo-600'} text-white mono text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:opacity-90`}>
                      Initialize Direct Sync
                    </button>
                </div>

                <div className="glass-card p-7 sm:p-10 lg:p-12 rounded-[2.75rem] sm:rounded-[4rem] border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-12">
                      <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">{isSchool ? 'Admissions \nConsole' : 'Placement \nPipeline'}</h3>
                      <span className="mono text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">3 ACTIVE</span>
                    </div>
                    <div className="space-y-10">
                      {activeReferrals.map((item: any, i) => (
                        <div key={i} className="flex items-center justify-between group/row cursor-pointer">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mono text-[11px] font-black text-slate-500 border border-white/5 group-hover/row:border-indigo-500/30 group-hover/row:text-white transition-all">
                                  {isSchool ? item.school[0] : item.company[0]}
                              </div>
                              <div>
                                  <p className="text-white text-base font-black tracking-tight">{isSchool ? item.school : item.company}</p>
                                  <p className="mono text-slate-600 text-[9px] font-black uppercase tracking-widest">{item.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`${isSchool ? 'text-emerald-400' : 'text-indigo-400'} mono text-[10px] font-black uppercase tracking-tight`}>{item.status}</p>
                              <p className="mono text-slate-700 text-[8px] font-black uppercase tracking-widest mt-1">{item.date}</p>
                            </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-12 py-6 rounded-[2.5rem] border border-white/5 text-slate-500 mono text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 hover:text-white transition-all">
                      {isSchool ? 'View All Applications' : 'Access Job Hub'}
                    </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
