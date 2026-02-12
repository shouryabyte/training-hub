
import React from 'react';

interface Collaborator {
  name: string;
  initials: string;
  color: string;
  avatarUrl?: string;
}

interface Project {
  title: string;
  category: string;
  student: string;
  description: string;
  image: string;
  tags: string[];
  collaborators: Collaborator[];
  activeCount: number;
}

const projects: Project[] = [
  {
    title: "NexFlow AI",
    category: "SaaS / AI",
    student: "Arjun M. (Tier 1 University)",
    description: "An automated workflow engine that integrates with Slack to summarize daily engineering standups using LLMs.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    tags: ["Next.js", "Python", "OpenAI"],
    activeCount: 8,
    collaborators: [
      { name: "Arjun M.", initials: "AM", color: "bg-indigo-500", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" },
      { name: "Priya S.", initials: "PS", color: "bg-emerald-500", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
      { name: "Kevin L.", initials: "KL", color: "bg-blue-500", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" },
    ]
  },
  {
    title: "EcoTrack",
    category: "Sustainability",
    student: "Sarah K. (Class 12 Elite)",
    description: "A mobile-first platform tracking personal carbon footprints with real-time API integrations from energy providers.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
    tags: ["React Native", "Node.js", "AWS"],
    activeCount: 3,
    collaborators: [
      { name: "Sarah K.", initials: "SK", color: "bg-rose-500", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" },
      { name: "Leo R.", initials: "LR", color: "bg-amber-500", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" },
    ]
  },
  {
    title: "DeFi Guard",
    category: "FinTech / Web3",
    student: "Vikram S. (University)",
    description: "A smart-contract vulnerability scanner built during the Nexchakra Placement Pro track.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
    tags: ["Solidity", "TypeScript", "Ethers.js"],
    activeCount: 14,
    collaborators: [
      { name: "Vikram S.", initials: "VS", color: "bg-violet-500", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100" },
      { name: "Anita B.", initials: "AB", color: "bg-cyan-500", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" },
      { name: "Dev J.", initials: "DJ", color: "bg-sky-500" },
      { name: "Zoe W.", initials: "ZW", color: "bg-purple-500", avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=100" },
    ]
  }
];

const AvatarGroup: React.FC<{ collaborators: Collaborator[]; activeCount: number }> = ({ collaborators, activeCount }) => (
  <div className="flex items-center gap-3">
    <div className="flex -space-x-2">
      {collaborators.map((c, i) => (
        <div 
          key={i} 
          title={c.name}
          className={`w-8 h-8 rounded-full border-2 border-slate-900 ${c.avatarUrl ? 'bg-slate-800' : c.color} flex items-center justify-center text-[8px] font-black text-white cursor-pointer hover:scale-110 transition-transform relative group/avatar overflow-hidden`}
        >
          {c.avatarUrl ? (
            <img 
              src={c.avatarUrl} 
              alt={c.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            c.initials
          )}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
            {c.name}
          </div>
        </div>
      ))}
      {activeCount > collaborators.length && (
        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">
          +{activeCount - collaborators.length}
        </div>
      )}
    </div>
    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{activeCount} Live</span>
    </div>
  </div>
);

export const ProductShowcase: React.FC = () => {
  return (
    <section id="showcase" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
              Real Products. <br />
              <span className="gradient-text">Neural Collaboration.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              We don't build calculators. Our students architect production-ready systems in a real-time, high-pressure collaborative environment.
            </p>
          </div>
          <div className="flex flex-col items-end gap-4">
             <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                284 active engineers currently coding
             </div>
             <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-xs">
               Join Project Lab
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {projects.map((project, i) => (
            <div key={i} className="group relative">
              <div className="relative overflow-hidden rounded-[2.5rem] aspect-[4/5] mb-8 border border-white/5 bg-slate-900 shadow-2xl transition-all duration-700 group-hover:scale-[1.02] group-hover:border-indigo-500/30">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100" 
                />
                
                {/* Live Status Overlay */}
                <div className="absolute top-6 right-6 z-20">
                  <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xl">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Live Session</span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10 w-full transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black tracking-widest uppercase bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white/70 border border-white/5">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight leading-none">{project.title}</h3>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    {project.description}
                  </p>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-2xl">
                          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white overflow-hidden">
                             {project.collaborators[0]?.avatarUrl ? (
                               <img src={project.collaborators[0].avatarUrl} className="w-full h-full object-cover" alt="Lead" />
                             ) : "L"}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white tracking-tight">{project.student}</p>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Project Lead</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Live Collaborators</p>
                      <AvatarGroup collaborators={project.collaborators} activeCount={project.activeCount} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
