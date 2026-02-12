import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listProjects, Project } from '../services/projectsService';

function openExternal(url: string) {
  try {
    const u = String(url || '').trim();
    if (!u) return;
    window.open(u, '_blank', 'noopener,noreferrer');
  } catch {
    // ignore
  }
}

export const ProjectsPage: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const title = useMemo(() => 'Project Labs', []);
  const live = useMemo(() => projects.filter((p) => p.status === 'LIVE'), [projects]);
  const upcoming = useMemo(() => projects.filter((p) => p.status !== 'LIVE'), [projects]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listProjects();
        if (mounted) setProjects(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Production Labs</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{title}</h1>
          <p className="text-slate-400 mt-4 font-medium max-w-2xl">
            Explore shipped projects and upcoming builds. Click any LIVE project to open the deployed experience.
          </p>
          {!token && (
            <p className="text-slate-500 text-xs font-medium mt-4">
              Public preview. Sign in to access protected labs and saved progress.
            </p>
          )}
        </div>

        {loading && <div className="text-slate-400 font-medium">Loading projects…</div>}
        {!loading && projects.length === 0 && (
          <div className="glass-card rounded-[2.5rem] border-white/10 p-8 text-slate-300 font-medium">
            No projects published yet. Check back soon.
          </div>
        )}

        {!!live.length && (
          <div className="mb-12">
            <div className="flex items-end justify-between gap-6 mb-6">
              <div>
                <p className="mono text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">Live</p>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Deployed Projects</h2>
              </div>
              <p className="text-slate-500 text-xs font-medium max-w-md text-right">
                Open the live site in a new tab. These are real deployments.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {live.map((p) => (
                <button
                  type="button"
                  key={p._id}
                  onClick={() => p.url && openExternal(p.url)}
                  disabled={!p.url}
                  className="text-left glass-card rounded-[2.5rem] border-white/10 p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-indigo-500/10 rounded-full blur-[70px] group-hover:scale-125 transition-transform duration-700"
                  ></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="mono text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">LIVE</span>
                    {p.cohortBadge && (
                      <span className="mono text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">{p.cohortBadge}</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-3">{p.title}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">{p.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(p.techStack || []).slice(0, 6).map((t, idx) => (
                      <span
                        key={`${p._id}:${t}:${idx}`}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span>{p.partner || 'Nexchakra Lab'}</span>
                    <span className="text-slate-400">{p.difficulty}</span>
                  </div>
                  {p.url && (
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">Open live</span>
                      <span className="text-indigo-300 text-xs font-black">↗</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {!!upcoming.length && (
          <div>
            <div className="flex items-end justify-between gap-6 mb-6">
              <div>
                <p className="mono text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-2">Future</p>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Upcoming Projects</h2>
              </div>
              <p className="text-slate-500 text-xs font-medium max-w-md text-right">
                These are planned labs managed by Admin. They appear here before going live.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((p) => (
                <div key={p._id} className="glass-card rounded-[2.5rem] border-white/10 p-8 relative overflow-hidden">
                  <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-amber-500/10 rounded-full blur-[70px]"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="mono text-[9px] font-black uppercase tracking-[0.4em] text-amber-400">{p.status}</span>
                    {p.cohortBadge && (
                      <span className="mono text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">{p.cohortBadge}</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-3">{p.title}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">{p.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(p.techStack || []).slice(0, 6).map((t, idx) => (
                      <span
                        key={`${p._id}:${t}:${idx}`}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span>{p.partner || 'Nexchakra Lab'}</span>
                    <span className="text-slate-400">{p.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
