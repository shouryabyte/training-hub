
import React from 'react';

interface CategoryProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
  progress?: number;
}

const CategoryCard: React.FC<CategoryProps> = ({ title, desc, icon, accent, progress = 0 }) => {
  // Safe color mapping for standard Tailwind colors used in this component
  const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    blue: { text: 'text-blue-400', bg: 'bg-blue-500', border: 'hover:border-blue-500/50', glow: 'shadow-blue-500/20' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500', border: 'hover:border-purple-500/50', glow: 'shadow-purple-500/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'hover:border-emerald-500/50', glow: 'shadow-emerald-500/20' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500', border: 'hover:border-amber-500/50', glow: 'shadow-amber-500/20' },
    sky: { text: 'text-sky-400', bg: 'bg-sky-500', border: 'hover:border-sky-500/50', glow: 'shadow-sky-500/20' },
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500', border: 'hover:border-indigo-500/50', glow: 'shadow-indigo-500/20' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500', border: 'hover:border-rose-500/50', glow: 'shadow-rose-500/20' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'hover:border-cyan-500/50', glow: 'shadow-cyan-500/20' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-500', border: 'hover:border-violet-500/50', glow: 'shadow-violet-500/20' },
  };

  const colors = colorMap[accent] || colorMap.indigo;

  return (
    <div className={`glass-card p-6 rounded-2xl group ${colors.border} transition-all duration-500 flex flex-col h-full relative overflow-hidden hover:shadow-2xl ${colors.glow}`}>
      <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-slate-800 border border-slate-700 group-hover:scale-110 group-hover:border-slate-600 transition-all duration-300`}>
        <span className={`${colors.text}`}>{icon}</span>
      </div>
      
      <h4 className="text-lg font-bold mb-3 text-slate-100 group-hover:text-white transition-colors tracking-tight">{title}</h4>
      <p className="text-slate-400 text-sm mb-8 flex-grow leading-relaxed">{desc}</p>
      
      {/* Progress Indicator Section */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">Track Depth</span>
          <span className={`text-[10px] font-black ${colors.text} tabular-nums`}>{progress}%</span>
        </div>
        <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.bg} transition-all duration-1000 ease-out rounded-full opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <button className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest bg-slate-900 border border-slate-800 hover:bg-white hover:text-slate-950 hover:border-white transition-all duration-300 shadow-lg active:scale-95`}>
        {progress > 0 ? 'Resume Track' : 'Start Journey'}
      </button>
    </div>
  );
};

export const ProgramSection: React.FC = () => {
  const schoolCategories = [
    {
      title: "Career Path Navigator",
      desc: "Holistic guidance to help students discover their passion and select the perfect tech specialization before college.",
      accent: "blue",
      progress: 45,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7"></path></svg>
    },
    {
      title: "Elite College Admissions",
      desc: "End-to-end support for cracking admissions into top-tier universities like IITs, Ivy Leagues, and Global Tech Hubs.",
      accent: "purple",
      progress: 12,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
    },
    {
      title: "Global Mentorship Circle",
      desc: "Direct 1:1 access to top-tier industry mentors and alumni from world-class institutions to guide elite students.",
      accent: "emerald",
      progress: 88,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    },
    {
      title: "Consultancy & Strategy",
      desc: "Strategic guidance for international studies, SOP crafting, and professional consultancy for global education.",
      accent: "amber",
      progress: 30,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
    },
    {
      title: "Student Mentorship",
      desc: "Connect with seniors from dream colleges for peer-to-peer guidance on academic stress, campus life, and transition management.",
      accent: "sky",
      progress: 72,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    }
  ];

  const universityCategories = [
    {
      title: "Full-Stack Dev",
      desc: "Industry-standard MERN, Next.js, and Cloud deployment engineering for modern software products.",
      accent: "indigo",
      progress: 55,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
    },
    {
      title: "AI & Data Science",
      desc: "Master Generative AI, LLMs, and large-scale data processing architectures used by top tech firms.",
      accent: "rose",
      progress: 20,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
    },
    {
      title: "Placement Sprint",
      desc: "High-intensity DSA, Mock Interviews, and AI-powered Resume optimization for high-package roles.",
      accent: "cyan",
      progress: 95,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    },
    {
      title: "Real-Product Lab",
      desc: "Work on Nexchakra's internal products and partner tools. Build software used by real people.",
      accent: "violet",
      progress: 40,
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
    }
  ];

  return (
    <section id="programs" className="py-24 px-6 bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Your <span className="gradient-text">Success Engine.</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Engineered tracks designed to turn high-potential learners into high-impact industry leaders.</p>
        </div>

        {/* School Track */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-l-4 border-emerald-500 pl-8">
            <div>
              <span className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px]">Division 01</span>
              <h3 className="text-3xl md:text-4xl font-black text-white mt-2">Class 11 & 12 <span className="text-slate-500">Foundation</span></h3>
              <p className="text-slate-500 mt-2 font-medium">Preparing the global elite for top-tier academic entries.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {schoolCategories.map((cat, i) => (
              <CategoryCard key={i} {...cat} />
            ))}
          </div>
        </div>

        {/* University Track */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-l-4 border-indigo-500 pl-8">
            <div>
              <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">Division 02</span>
              <h3 className="text-3xl md:text-4xl font-black text-white mt-2">University <span className="text-slate-500">Acceleration</span></h3>
              <p className="text-slate-500 mt-2 font-medium">Securing high-package placements through technical dominance.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {universityCategories.map((cat, i) => (
              <CategoryCard key={i} {...cat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
