import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicCatalog } from '../services/catalogService';
import type { Division } from '../services/studentService';
import { DivisionCard } from '../components/DivisionCard';

const SkeletonCard: React.FC<{ i: number }> = ({ i }) => {
  return (
    <div className="glass-card rounded-[2.25rem] border-white/10 p-7 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-[80px]" />
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10" />
        <div className="flex-1">
          <div className="h-5 w-44 bg-white/5 rounded-lg border border-white/10" />
          <div className="mt-3 h-4 w-full bg-white/5 rounded-lg border border-white/10" />
          <div className="mt-2 h-4 w-5/6 bg-white/5 rounded-lg border border-white/10" />
        </div>
      </div>
      <div className="mt-6">
        <div className="h-3 w-32 bg-white/5 rounded-lg border border-white/10" />
        <div className="mt-3 h-2 bg-white/5 rounded-full border border-white/10 overflow-hidden">
          <div className="h-full bg-indigo-500/30" style={{ width: `${35 + (i % 5) * 10}%` }} />
        </div>
      </div>
      <div className="mt-7 h-10 w-full bg-white/5 rounded-2xl border border-white/10" />
    </div>
  );
};

export const HomePage: React.FC = () => {
  const nav = useNavigate();
  const { token, user } = useAuth();
  const isLoggedIn = Boolean(token);

  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const catalog = await getPublicCatalog();
        if (!mounted) return;
        setDivisions((catalog.divisions || []) as any);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load catalog');
        setDivisions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const alpha = useMemo(() => {
    return (divisions || [])
      .filter((d: any) => String(d?.batch?.name) === 'ALPHA' && d.isActive !== false)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .slice(0, 5);
  }, [divisions]);

  const delta = useMemo(() => {
    return (divisions || [])
      .filter((d: any) => String(d?.batch?.name) === 'DELTA' && d.isActive !== false)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .slice(0, 4);
  }, [divisions]);

  return (
    <div>
      <section className="px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="py-16">
            <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Trust-First EdTech Platform</p>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.05]">
              Build foundations. Ship projects. Earn outcomes.
            </h1>
            <p className="text-slate-400 mt-5 font-medium max-w-xl leading-relaxed">
              Nexchakra designs structured programs for students — from Class 11–12 foundations to university acceleration — built on credibility,
              mentorship, and execution.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  nav(
                    isLoggedIn
                      ? user?.role === 'ADMIN'
                        ? '/admin'
                        : user?.role === 'TEACHER'
                          ? '/teacher'
                          : '/dashboard'
                      : '/auth?returnTo=%2Fdashboard'
                  )
                }
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                Get Started
              </button>
              <Link
                to="/#batches"
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 text-center"
              >
                Explore Programs
              </Link>
            </div>
          </div>

          <div className="py-16">
            <div className="glass-card rounded-[3rem] border-white/10 p-10 relative overflow-hidden">
              <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]"></div>
              <p className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Company & Trust</p>
              <div className="space-y-6">
                <div>
                  <p className="text-white font-black text-lg tracking-tight">Mission</p>
                  <p className="text-slate-400 font-medium mt-2">
                    Make education feel professional: clear systems, measurable progress, and mentor-led execution.
                  </p>
                </div>
                <div>
                  <p className="text-white font-black text-lg tracking-tight">Vision</p>
                  <p className="text-slate-400 font-medium mt-2">A trusted, scalable platform where students learn by building, not by memorizing.</p>
                </div>
                <div>
                  <p className="text-white font-black text-lg tracking-tight">Teaching Philosophy</p>
                  <p className="text-slate-400 font-medium mt-2">
                    Systems + mentorship + feedback loops {'→'} compounding outcomes. We train for reality, not hype.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-10">
                {[
                  {
                    title: 'Weekly Cadence',
                    body: 'Clear milestones, reviews, and deliverables that keep momentum compounding.',
                  },
                  {
                    title: 'Mentor Feedback',
                    body: 'Tight loops: clarity on what to fix, what to build next, and why it matters.',
                  },
                  {
                    title: 'Project Signals',
                    body: 'Progress is shown through shipped work — not just time spent watching.',
                  },
                  {
                    title: 'Trust & Policies',
                    body: 'Transparent plans, platform access rules, and consistent support for learners.',
                  },
                ].map((s) => (
                  <div key={s.title} className="bg-slate-950/50 border border-white/10 rounded-2xl p-5">
                    <div className="text-white font-black text-base tracking-tight">{s.title}</div>
                    <div className="text-slate-400 text-sm font-medium mt-2 leading-relaxed">{s.body}</div>
                  </div>
                ))}
              </div>
              <div className="mt-10 bg-slate-950/50 border border-white/10 rounded-2xl p-5">
                <p className="text-slate-300 text-sm font-medium leading-relaxed">
                  Credibility matters. Programs are designed with clear outcomes, transparent policies, and a roadmap you can verify.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="batches" className="px-6 py-20 border-y border-white/5 bg-slate-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Programs</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Two core tracks. One execution system.</h2>
            <p className="text-slate-400 mt-4 font-medium max-w-2xl">Choose the track aligned to your stage—foundation (Alpha) or acceleration (Delta).</p>
          </div>

          {error && (
            <div className="mb-10 bg-red-950/10 border border-red-500/20 rounded-[2.5rem] p-8 text-slate-300 font-medium">
              Catalog unavailable: {error}. Start the backend and refresh.
            </div>
          )}

          <div className="space-y-14">
            <div className="glass-card rounded-[3rem] border-white/10 p-10 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]"
              ></div>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div>
                  <p className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Alpha Batch</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">Class 11 & 12 Foundation</h3>
                  <p className="text-slate-400 font-medium mt-3 max-w-2xl">Preparing the global elite for top-tier academic entries.</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/alpha"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 text-center"
                  >
                    Explore Alpha
                  </Link>
                  <Link
                    to="/plans#alpha"
                    className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 text-center"
                  >
                    View Plans
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} i={i} />)
                  : alpha.map((d, idx) => (
                      <DivisionCard
                        key={d._id}
                        division={d}
                        index={idx}
                        variant="compact"
                        action={
                          <Link
                            to="/alpha#pricing"
                            className="block w-full text-center bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95"
                          >
                            Resume Track
                          </Link>
                        }
                      />
                    ))}
              </div>
            </div>

            <div className="glass-card rounded-[3rem] border-white/10 p-10 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px]"
              ></div>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div>
                  <p className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Delta Batch</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">University Acceleration</h3>
                  <p className="text-slate-400 font-medium mt-3 max-w-2xl">Securing high-package placements through technical dominance.</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/delta"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 text-center"
                  >
                    Explore Delta
                  </Link>
                  <Link
                    to="/plans#delta"
                    className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 text-center"
                  >
                    View Plans
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} i={i + 10} />)
                  : delta.map((d, idx) => (
                      <DivisionCard
                        key={d._id}
                        division={d}
                        index={idx}
                        variant="compact"
                        action={
                          <Link
                            to="/delta#pricing"
                            className="block w-full text-center bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95"
                          >
                            Resume Track
                          </Link>
                        }
                      />
                    ))}
              </div>

              <div className="mt-12 bg-slate-950/40 border border-white/10 rounded-[2.5rem] p-8">
                <p className="text-white font-black text-lg tracking-tight">Built for real execution</p>
                <p className="text-slate-400 font-medium mt-2 max-w-3xl">
                  A weekly system: clear milestones, practical projects, and focused feedback loops that compound. No fluff - just
                  measurable progress.
                </p>
                <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm text-slate-300 font-medium">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Cadence</p>
                    <p>Weekly goals and reviews so learners do not drift.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Signals</p>
                    <p>Track depth, outcomes, and submissions - not just watch time.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="mono text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Clarity</p>
                    <p>Simple structure that works across Alpha and Delta paths.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
