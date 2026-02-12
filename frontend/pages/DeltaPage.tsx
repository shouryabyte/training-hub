import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicCatalog } from '../services/catalogService';
import type { Division } from '../services/studentService';
import { DivisionCard } from '../components/DivisionCard';

function formatInrPaise(amountPaise: number | undefined) {
  if (!amountPaise || !Number.isFinite(Number(amountPaise))) return '—';
  return `₹${(Number(amountPaise) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export const DeltaPage: React.FC = () => {
  const nav = useNavigate();
  const { token, user } = useAuth();
  const isStaff = Boolean(user?.role && user.role !== 'STUDENT');

  const [courses, setCourses] = useState<Division[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const catalog = await getPublicCatalog();
        const divisions = (catalog.divisions || []).filter((d: any) => String(d?.batch?.name) === 'DELTA');
        if (mounted) {
          setCourses(divisions);
          setPlans(catalog.plans || []);
        }
      } catch {
        if (mounted) {
          setCourses([]);
          setPlans([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sorted = useMemo(() => {
    return [...(courses || [])]
      .filter((c) => c.isActive !== false)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }, [courses]);

  const deltaPlans = useMemo(() => plans.filter((p) => String(p?.batch?.name) === 'DELTA' && p.isActive !== false), [plans]);

  const buy = (planKey: string) => {
    if (token && isStaff) return;
    if (!token) {
      nav(`/auth?returnTo=${encodeURIComponent(`/checkout?planId=${planKey}`)}`);
      return;
    }
    nav(`/checkout?planId=${encodeURIComponent(planKey)}`);
  };

  return (
    <div className="px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Division 02 • Delta</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            University <span className="text-slate-400">Acceleration</span>
          </h1>
          <p className="text-slate-400 mt-4 font-medium max-w-3xl">
            Securing high-package placements through technical dominance — with real products, interview systems, and measurable execution.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-[2.5rem] border-white/10 p-8">
            <h2 className="text-2xl font-black text-white tracking-tight mb-4">Career Outcomes</h2>
            <ul className="space-y-3 text-slate-400 font-medium text-sm">
              {[
                'Production-grade portfolio with real product labs.',
                'Interview readiness systems for placements (DSA + system design + behavioral).',
                'Mentor reviews and structured execution cadence.',
              ].map((t) => (
                <li key={t} className="flex gap-3 items-start">
                  <span className="text-indigo-400 font-black">▸</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card rounded-[2.5rem] border-white/10 p-8">
            <h2 className="text-2xl font-black text-white tracking-tight mb-4">Placement & Skills</h2>
            <p className="text-slate-400 font-medium">
              Designed to move students from “learning” to “shipping” with feedback loops and measurable weekly wins.
            </p>
          </div>
        </div>

        <div className="mt-12" id="divisions">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Delta Divisions</h2>
              <p className="text-slate-400 font-medium mt-2">Career-first tracks with clear outcomes and industry relevance.</p>
            </div>
            <a
              href="#pricing"
              className="hidden sm:inline-flex bg-white/5 hover:bg-white/10 text-white px-7 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95"
            >
              View Pricing
            </a>
          </div>

          {loading ? (
            <div className="text-slate-400 font-medium">Loading courses…</div>
          ) : sorted.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sorted.map((d, idx) => (
                <DivisionCard
                  key={d._id}
                  division={d}
                  index={idx}
                  action={
                    <a
                      href="#pricing"
                      className="block w-full text-center bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95"
                    >
                      Resume Track
                    </a>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-slate-400 font-medium">
              No divisions found. Ask a teacher to create Delta courses, or check your backend seed.
            </div>
          )}
        </div>

        <div className="mt-14" id="pricing">
          <h2 className="text-2xl font-black text-white tracking-tight mb-6">Delta Plans</h2>
          {loading ? (
            <div className="text-slate-400 font-medium">Loading pricing…</div>
          ) : deltaPlans.length ? (
            <div className="grid md:grid-cols-2 gap-6">
              {deltaPlans.map((p) => (
                <div
                  key={p.key}
                  className={`glass-card rounded-[2.5rem] border p-8 relative overflow-hidden ${
                    p.isFeatured ? 'border-indigo-500/30 bg-indigo-600/5' : 'border-white/10'
                  }`}
                >
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/5 rounded-full blur-[70px]"></div>
                  <p className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Plan</p>
                  <h3 className="text-2xl font-black text-white tracking-tight">{p.title || p.key}</h3>
                  <div className="text-4xl font-black text-white mt-4">{formatInrPaise(p.amount)}</div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">{p.durationLabel || '—'}</p>
                  <ul className="mt-8 space-y-3 text-slate-400 font-medium text-sm">
                    {(p.includedDivisions || []).slice(0, 6).map((d: any) => (
                      <li key={String(d?._id || d)} className="flex gap-3 items-start">
                        <span className="text-indigo-400 font-black">▸</span>
                        <span>{String(d?.name || d)}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => buy(String(p.key))}
                    disabled={token && isStaff}
                    className="mt-10 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 disabled:opacity-60"
                  >
                    {token && isStaff ? 'Staff Mode' : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 font-medium">No active Delta plans yet.</div>
          )}

          <p className="text-slate-500 text-xs font-medium mt-6">
            Payments are authentication-gated. You will be redirected to sign in before checkout.
          </p>
          {token && isStaff && (
            <p className="text-slate-400 text-xs font-medium mt-3">
              Staff accounts can’t purchase plans. Use your workspace to manage courses.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
