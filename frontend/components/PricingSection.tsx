
import React from 'react';

interface PlanProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  accent: 'emerald' | 'indigo';
}

const PlanCard: React.FC<PlanProps> = ({ name, price, period, description, features, isPopular, buttonText, accent }) => {
  const styles = {
    emerald: {
      border: 'border-emerald-500/30',
      ring: 'ring-emerald-500/30',
      bg: 'bg-emerald-600',
      hoverBg: 'hover:bg-emerald-500',
      shadow: 'shadow-emerald-600/20',
      glow: 'hover:shadow-emerald-500/20',
      text: 'text-emerald-400',
      icon: 'text-emerald-400',
      outlineBorder: 'border-emerald-500/20',
      outlineHover: 'hover:bg-emerald-500/10',
      outlineText: 'text-emerald-300'
    },
    indigo: {
      border: 'border-indigo-500/30',
      ring: 'ring-indigo-500/30',
      bg: 'bg-indigo-600',
      hoverBg: 'hover:bg-indigo-500',
      shadow: 'shadow-indigo-600/20',
      glow: 'hover:shadow-indigo-500/20',
      text: 'text-indigo-400',
      icon: 'text-indigo-400',
      outlineBorder: 'border-indigo-500/20',
      outlineHover: 'hover:bg-indigo-500/10',
      outlineText: 'text-indigo-300'
    }
  };

  const s = styles[accent];

  return (
    <div className={`relative glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.03] flex flex-col group ${s.glow} ${isPopular ? `${s.border} ring-2 ${s.ring} bg-white/5` : 'border-white/5 hover:border-white/20'}`}>
      {isPopular && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${s.bg} text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl ${s.shadow}`}>
          ELITE SELECTION
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">{name}</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
      </div>
      <div className="mb-10 flex items-baseline gap-2">
        <span className="text-5xl font-black text-white tracking-tighter">{price}</span>
        <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">{period}</span>
      </div>
      <ul className="space-y-4 mb-12 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-4 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            <div className={`w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-white/10`}>
               <svg className={`w-3 h-3 ${s.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
               </svg>
            </div>
            {feature}
          </li>
        ))}
      </ul>
      <button 
        className={`w-full py-5 rounded-2xl font-black transition-all text-sm tracking-widest uppercase shadow-xl ${
          isPopular 
            ? `${s.bg} ${s.hoverBg} text-white shadow-indigo-600/30 active:scale-95` 
            : `bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95`
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export const PricingSection: React.FC = () => {
  const schoolPlans: PlanProps[] = [
    {
      name: "Path Starter",
      description: "Discovery module for students finding their niche in the global tech ecosystem.",
      price: "₹299",
      period: "/mo",
      accent: "emerald",
      buttonText: "Enroll Now",
      features: [
        "Career Path Discovery",
        "Monthly Mentor Sync",
        "Tech Community Access",
        "Profile Audit Report"
      ]
    },
    {
      name: "Global Admissions",
      isPopular: true,
      description: "Strategic blueprint for Ivy Leagues, IITs, and top global tech institutions.",
      price: "₹499",
      period: "/mo",
      accent: "emerald",
      buttonText: "Enroll Now",
      features: [
        "Ivy-Standard SOP/Essay Support",
        "SAT/JEE Profile Maxing",
        "Weekly Alumni Access",
        "Unlimited AI Interview Simulations"
      ]
    },
    {
      name: "School Elite",
      description: "The gold standard for guaranteed outcomes and 24/7 success consulting.",
      price: "₹999",
      period: "/mo",
      accent: "emerald",
      buttonText: "Enroll Now",
      features: [
        "Priority Consultant Access",
        "Global Internship Referrals",
        "Founder-Led Mentorship",
        "Lifetime Alumni Network"
      ]
    }
  ];

  const universityPlans: PlanProps[] = [
    {
      name: "Skill Accelerator",
      description: "High-density technical mastery for high-package engineering roles.",
      price: "₹499",
      period: "/mo",
      accent: "indigo",
      buttonText: "Enroll Now",
      features: [
        "Advanced DSA Intensity",
        "Full-Stack Real-Product Work",
        "AI Specialization Track",
        "Live Masterclasses"
      ]
    },
    {
      name: "Placement Pro",
      isPopular: true,
      description: "Direct conversion to high-package offers at global tech giants.",
      price: "₹999",
      period: "/mo",
      accent: "indigo",
      buttonText: "Enroll Now",
      features: [
        "Priority Company Referrals",
        "1:1 CTO Level Coaching",
        "Custom Product Lab Access",
        "Post-Placement Career Growth"
      ]
    },
    {
      name: "University Elite",
      description: "For the future 1% of engineers and tech founders.",
      price: "₹1,299",
      period: "/mo",
      accent: "indigo",
      buttonText: "Enroll Now",
      features: [
        "Angel Network Referrals",
        "Founding Engineer Coaching",
        "International Relocation Aid",
        "VC Funding Strategy"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tight">Investment in <br/><span className="gradient-text">Excellence.</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">Select your success track. Our curriculum is dynamic, industry-aligned, and outcome-driven.</p>
        </div>

        {/* Section 1: School Track */}
        <div className="mb-40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-l-4 border-emerald-500 pl-8">
            <div>
              <span className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px]">Track Alpha</span>
              <h3 className="text-4xl font-black text-white mt-2">High School Foundation</h3>
              <p className="text-slate-500 mt-2 font-medium">Building the global elite pipeline for Class 11 & 12.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {schoolPlans.map((plan, i) => (
              <PlanCard key={i} {...plan} />
            ))}
          </div>
        </div>

        {/* Section 2: University Track */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-l-4 border-indigo-500 pl-8">
            <div>
              <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">Track Delta</span>
              <h3 className="text-4xl font-black text-white mt-2">University Professional</h3>
              <p className="text-slate-500 mt-2 font-medium">Placement dominance for Engineering & Tech students.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {universityPlans.map((plan, i) => (
              <PlanCard key={i} {...plan} />
            ))}
          </div>
        </div>

        {/* Audit Call to Action */}
        <div className="mt-32 glass-card p-12 rounded-[3rem] border-white/10 flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] group-hover:bg-indigo-600/20 transition-all duration-700"></div>
          <div className="flex items-center gap-8 text-center md:text-left flex-col md:flex-row z-10">
            <div className="w-20 h-20 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center text-indigo-400 shrink-0 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-2xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-3xl font-black text-white mb-2 tracking-tight">Ready to Audit your Career?</h4>
              <p className="text-slate-400 text-lg max-w-md font-medium">Schedule a 15-minute diagnostic call with a Nexchakre success lead.</p>
            </div>
          </div>
          <button className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all hover:scale-105 shadow-2xl z-10 active:scale-95 whitespace-nowrap">
            Book Free Diagnostic
          </button>
        </div>
      </div>
    </section>
  );
};
