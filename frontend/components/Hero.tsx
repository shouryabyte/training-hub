
import React from 'react';

interface HeroProps {
  onStartClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <header className="relative pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-24 px-4 sm:px-6 overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-30 grayscale"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-loop-3031-large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark Overlays for Readability */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950"></div>
      </div>

      {/* Dynamic Background Glows */}
      <div className="hero-glow -top-[20%] -left-[10%] opacity-50"></div>
      <div className="hero-glow -bottom-[20%] -right-[10%] !bg-purple-600/10 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-white/10 rounded-full bg-white/5 backdrop-blur-md text-indigo-300 font-semibold text-xs tracking-widest uppercase animate-pulse">
          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
          Engineering the Future of Talent
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-white">
          Code the Next <br />
          <span className="gradient-text">Great Product.</span>
        </h1>
        
        <p className="text-base sm:text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-10 sm:mb-12 leading-relaxed font-medium">
          Whether you're in high school aiming for an <span className="text-emerald-400">Ivy League</span> or a university student targeting a <span className="text-indigo-400">FAANG role</span>, Nexchakra is your ultimate career launchpad.
        </p>
        
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg">
            <button onClick={onStartClick} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-500/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group">
              Start Your Track
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
            <button onClick={onStartClick} className="w-full sm:w-auto glass-card border border-white/10 hover:bg-white/5 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 active:scale-95">
              AI Career Audit
            </button>
          </div>
          
          <a 
            href="#programs" 
            className="group flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-all duration-300"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Explore Full Programs</span>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all">
              <svg className="w-4 h-4 animate-bounce mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7m14-8l-7 7-7-7" />
              </svg>
            </div>
          </a>
        </div>

        <div className="mt-24 w-full">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mb-10">Trusted by students at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-700">
             {['GOOGLE', 'META', 'AMAZON', 'NVIDIA', 'OPENAI', 'TESLA'].map((brand) => (
               <span key={brand} className="font-black text-2xl tracking-tighter text-white hover:text-indigo-400 cursor-default transition-colors">{brand}</span>
             ))}
          </div>
        </div>
      </div>

      {/* Abstract floating shapes for "Advanced" feel */}
      <div className="hidden lg:block absolute top-1/4 -right-12 w-64 h-64 border border-indigo-500/20 rounded-3xl rotate-12 animate-float pointer-events-none z-0"></div>
      <div className="hidden lg:block absolute bottom-1/4 -left-12 w-48 h-48 border border-purple-500/20 rounded-full -rotate-12 animate-float !animation-delay-2000 pointer-events-none z-0"></div>
    </header>
  );
};
