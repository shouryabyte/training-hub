import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicCatalog } from '../services/catalogService';

function formatInrPaise(amountPaise: number | undefined) {
  if (!amountPaise || !Number.isFinite(Number(amountPaise))) return '—';
  return `₹${(Number(amountPaise) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export const PlansPage: React.FC = () => {
  const nav = useNavigate();
  const { token, user } = useAuth();
  const isStaff = Boolean(user?.role && user.role !== 'STUDENT');

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const catalog = await getPublicCatalog();
        if (!mounted) return;
        setPlans(catalog.plans || []);
      } catch {
        if (mounted) setPlans([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const alphaPlans = useMemo(() => plans.filter((p) => String(p?.batch?.name) === 'ALPHA' && p.isActive !== false), [plans]);
  const deltaPlans = useMemo(() => plans.filter((p) => String(p?.batch?.name) === 'DELTA' && p.isActive !== false), [plans]);

  const buy = (planKey: string) => {
    if (token && isStaff) return;
    if (!token) {
      nav(`/auth?returnTo=${encodeURIComponent(`/checkout?planId=${planKey}`)}`);
      return;
    }
    nav(`/checkout?planId=${encodeURIComponent(planKey)}`);
  };

  const renderPlans = (list: any[]) => {
    if (loading) {
      return (
        <div className="text-slate-400 font-medium">Loading pricing…</div>
      );
    }
    if (!list.length) {
      return <div className="text-slate-400 font-medium">No active plans yet.</div>;
    }
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {list.map((p) => (
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
    );
  };

  return (
    <div className="px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Plans • Public</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Pricing</h1>
          <p className="text-slate-400 mt-4 font-medium max-w-2xl">
            Transparent, batch-specific plans. Payments are authentication-gated and link directly to your dashboard.
          </p>
          {token && isStaff && (
            <div className="mt-6 bg-slate-950/60 border border-white/10 rounded-2xl p-5 text-slate-300 font-medium">
              Staff accounts can’t purchase plans. Use your workspace for course management.
            </div>
          )}
        </div>

        <div id="alpha" className="mb-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Alpha Batch</p>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Class 11 & 12 Foundation</h2>
            </div>
            <Link
              to="/alpha"
              className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 text-center"
            >
              Explore Alpha
            </Link>
          </div>
          {renderPlans(alphaPlans)}
        </div>

        <div id="delta">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Delta Batch</p>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">University Acceleration</h2>
            </div>
            <Link
              to="/delta"
              className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 text-center"
            >
              Explore Delta
            </Link>
          </div>
          {renderPlans(deltaPlans)}
        </div>
      </div>
    </div>
  );
};
