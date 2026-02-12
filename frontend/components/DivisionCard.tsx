import React, { useMemo } from 'react';
import type { Division } from '../services/studentService';

type CardVariant = 'full' | 'compact';

const META: Record<
  string,
  { depth: number; accent: 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan'; icon: React.ReactNode }
> = {
  'career-path-navigator': {
    depth: 45,
    accent: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  'elite-college-admissions': {
    depth: 72,
    accent: 'purple',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0121 12.5c0 3.866-4.03 7-9 7s-9-3.134-9-7c0-.7.102-1.38.29-2.036L12 14z" />
      </svg>
    ),
  },
  'global-mentorship-circle': {
    depth: 88,
    accent: 'emerald',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-4-4h-1" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20H2v-2a4 4 0 014-4h1" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3.13a4 4 0 010 7.75" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3.13a4 4 0 000 7.75" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
  'consultancy-strategy': {
    depth: 60,
    accent: 'amber',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7l4 4-4 4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 11h4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15h6" />
      </svg>
    ),
  },
  'student-mentorship': {
    depth: 76,
    accent: 'cyan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9a6 6 0 11-12 0 6 6 0 0112 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21a8 8 0 10-16 0" />
      </svg>
    ),
  },
  'full-stack-development': {
    depth: 85,
    accent: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L4.5 12l5.25-5M14.25 7L19.5 12l-5.25 5" />
      </svg>
    ),
  },
  'ai-data-science': {
    depth: 78,
    accent: 'rose',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 7h10v10H7z" />
      </svg>
    ),
  },
  'placement-sprint': {
    depth: 95,
    accent: 'cyan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  'real-product-lab': {
    depth: 64,
    accent: 'purple',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M5 7h14M7 7v12a2 2 0 002 2h6a2 2 0 002-2V7" />
      </svg>
    ),
  },
};

function accentClass(accent: string) {
  const map: Record<string, { text: string; ring: string; bar: string; glow: string }> = {
    indigo: { text: 'text-indigo-400', ring: 'border-indigo-500/20 bg-indigo-500/10', bar: 'bg-indigo-500', glow: 'bg-indigo-500/10' },
    purple: { text: 'text-purple-300', ring: 'border-purple-500/20 bg-purple-500/10', bar: 'bg-purple-400', glow: 'bg-purple-500/10' },
    emerald: { text: 'text-emerald-300', ring: 'border-emerald-500/20 bg-emerald-500/10', bar: 'bg-emerald-400', glow: 'bg-emerald-500/10' },
    amber: { text: 'text-amber-300', ring: 'border-amber-500/20 bg-amber-500/10', bar: 'bg-amber-400', glow: 'bg-amber-500/10' },
    rose: { text: 'text-rose-300', ring: 'border-rose-500/20 bg-rose-500/10', bar: 'bg-rose-400', glow: 'bg-rose-500/10' },
    cyan: { text: 'text-cyan-300', ring: 'border-cyan-500/20 bg-cyan-500/10', bar: 'bg-cyan-400', glow: 'bg-cyan-500/10' },
  };
  return map[accent] || map.indigo;
}

export const DivisionCard: React.FC<{
  division: Division;
  index?: number;
  variant?: CardVariant;
  action?: React.ReactNode;
}> = ({ division, index = 0, variant = 'full', action }) => {
  const meta = useMemo(() => {
    const key = String(division.slug || '').toLowerCase().trim();
    if (META[key]) return META[key];
    const accents: any[] = ['indigo', 'purple', 'emerald', 'amber', 'rose', 'cyan'];
    const accent = accents[index % accents.length];
    const depth = Math.min(96, 55 + (Number(division.sortOrder || 0) % 6) * 7);
    return { depth, accent, icon: <span className="text-white/80 font-black">{String(division.name || '?').slice(0, 1)}</span> };
  }, [division.slug, division.sortOrder, division.name, index]);

  const ac = accentClass(meta.accent);
  const depth = Math.max(8, Math.min(99, meta.depth));

  return (
    <div className="glass-card rounded-[2.25rem] border-white/10 p-7 relative overflow-hidden">
      <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[80px] ${ac.glow}`} />

      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl border ${ac.ring} flex items-center justify-center ${ac.text}`}>
          {meta.icon}
        </div>
        <div className="flex-1">
          <p className="text-white font-black text-lg tracking-tight">{division.name}</p>
          <p className={`text-slate-400 font-medium mt-2 leading-relaxed ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
            {division.shortDescription || division.description || 'Outcome-driven training with clear execution milestones.'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
          <span>Track depth</span>
          <span className={ac.text}>{depth}%</span>
        </div>
        <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div className={`h-full ${ac.bar}`} style={{ width: `${depth}%` }} />
        </div>
      </div>

      {variant === 'full' && (
        <div className="mt-6 grid grid-cols-1 gap-3">
          <div className="flex flex-wrap gap-2">
            {(division.highlights || []).slice(0, 3).map((h) => (
              <span
                key={h}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest"
              >
                {h}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(division.outcomes || []).slice(0, 3).map((o) => (
              <span
                key={o}
                className="px-3 py-1.5 rounded-full bg-slate-950/40 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest"
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7">
        {action || (
          <button
            type="button"
            className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95"
          >
            {division.hasResumeTrack !== false ? 'Resume Track' : 'Open Track'}
          </button>
        )}
      </div>
    </div>
  );
};

