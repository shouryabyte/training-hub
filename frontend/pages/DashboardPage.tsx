import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe, MeResponse } from '../services/meService';
import { enrollDivision, Division } from '../services/studentService';
import { listPublicCourses } from '../services/catalogService';
import { DivisionCard } from '../components/DivisionCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<Division[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const refreshMe = async () => {
    try {
      const data = await getMe();
      setMe(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshMe();
  }, []);

  const activeBatch = useMemo(() => {
    const b = (me?.user as any)?.batch;
    const name = String(b?.name || '');
    return name === 'ALPHA' || name === 'DELTA' ? (name as 'ALPHA' | 'DELTA') : null;
  }, [me]);

  const enrolledDivisionIds = useMemo(() => {
    const ids = new Set<string>();
    for (const e of me?.enrollments || []) {
      const d = (e as any).division;
      if (d?._id) ids.add(String(d._id));
      else if (typeof d === 'string') ids.add(String(d));
    }
    return ids;
  }, [me]);

  useEffect(() => {
    if (!activeBatch) return;
    let mounted = true;
    setLoadingCourses(true);
    (async () => {
      try {
        const list = await listPublicCourses(activeBatch);
        if (mounted) setCourses(list);
      } catch {
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoadingCourses(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeBatch]);

  const courseById = useMemo(() => {
    const map = new Map<string, Division>();
    for (const c of courses || []) map.set(String(c._id), c);
    for (const e of me?.enrollments || []) {
      const d = (e as any).division;
      if (d && typeof d === 'object' && d._id) map.set(String(d._id), d as Division);
    }
    return map;
  }, [courses, me]);

  const normalizedEnrollments = useMemo(() => {
    return (me?.enrollments || []).map((e: any) => {
      const raw = e?.division;
      const id = raw?._id ? String(raw._id) : typeof raw === 'string' ? raw : '';
      const division = (raw && typeof raw === 'object' ? raw : null) || (id ? courseById.get(id) : null);
      return { ...e, _divisionId: id, _division: division };
    });
  }, [me, courseById]);

  const availableCourses = useMemo(() => {
    return (courses || []).filter((c) => c.isActive !== false && !enrolledDivisionIds.has(String(c._id)));
  }, [courses, enrolledDivisionIds]);

  const handleEnroll = async (divisionId: string) => {
    setEnrolling(divisionId);
    try {
      await enrollDivision(divisionId);
      await refreshMe();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Enroll failed');
      if (String(e?.data?.message || '').toLowerCase().includes('purchase')) nav('/plans');
    } finally {
      setEnrolling(null);
    }
  };

  const latestPurchase = (me?.purchases || [])[0] as any;
  const isValid = latestPurchase?.validUntil ? new Date(latestPurchase.validUntil).getTime() > Date.now() : Boolean(latestPurchase);

  return (
    <div className="px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Dashboard • Protected</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            {user?.name ? `Welcome, ${user.name}` : 'Dashboard'}
          </h1>
          <p className="text-slate-400 mt-4 font-medium max-w-2xl">
            Your account, plan validity, and enrolled courses — designed for real execution.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
            <h2 className="text-2xl font-black text-white tracking-tight mb-6">Profile</h2>
            <div className="space-y-3 text-slate-300 font-medium">
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Name</span>
                <div className="text-white font-black">{user?.name || '—'}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Email</span>
                <div className="text-white font-black">{user?.email || '—'}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Role</span>
                <div className="text-white font-black">{user?.role || '—'}</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Active batch</p>
                <p className="text-white font-black text-xl mt-2">{activeBatch || '—'}</p>
              </div>
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Validity</p>
                <p className={`font-black text-xl mt-2 ${isValid ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {latestPurchase?.validUntil ? new Date(latestPurchase.validUntil).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-2">
            <h2 className="text-2xl font-black text-white tracking-tight mb-6">Plan & Purchases</h2>
            {loading ? (
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-6">
                <p className="text-slate-400 font-medium">Loading your dashboard...</p>
              </div>
            ) : (me?.purchases || []).length ? (
              <div className="space-y-4">
                {(me?.purchases || []).slice(0, 4).map((p: any) => (
                  <div key={p._id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-white font-black text-lg tracking-tight">{p.planId?.title || 'Plan'}</p>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">
                          {p.batchId?.name ? `Batch ${p.batchId.name}` : 'Batch —'} • {String(p.provider || 'provider').toUpperCase()} •{' '}
                          {p.status}
                        </p>
                      </div>
                      <div className="text-slate-300 text-sm font-bold">
                        {(p.amount ? `₹${(Number(p.amount) / 100).toLocaleString()}` : '—')}{' '}
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{p.status}</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-4 text-slate-400 text-sm font-medium">
                      <div>
                        Paid: <span className="text-white font-black">{p.paidAt ? new Date(p.paidAt).toLocaleString() : '—'}</span>
                      </div>
                      <div>
                        Valid Until:{' '}
                        <span className="text-white font-black">{p.validUntil ? new Date(p.validUntil).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-6">
                <p className="text-slate-400 font-medium">No purchases yet. Buy a plan to unlock a batch and enroll in courses.</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/plans"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 text-center"
                  >
                    View Plans
                  </Link>
                  <Link
                    to="/ai-labs"
                    className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 text-center"
                  >
                    Try AI Labs
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-10">
          <div className="glass-card rounded-[2.5rem] border-white/10 p-8">
            <div className="flex items-end justify-between gap-6 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">My Enrollments</h2>
                <p className="text-slate-400 font-medium mt-2 text-sm">Course names, quick outcomes, and batch context.</p>
              </div>
              <div className="hidden sm:block px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-[0.35em]">
                {normalizedEnrollments.length} enrolled
              </div>
            </div>
            <div className="space-y-4">
              {normalizedEnrollments.map((e: any, idx: number) => {
                const d: Division | null = e._division || null;
                const fallback: Division = {
                  _id: e._divisionId || e._id,
                  name: e._divisionId ? `Course • ${String(e._divisionId).slice(0, 10)}…` : 'Course',
                  batch: { _id: '', name: (activeBatch || 'ALPHA') as any },
                  hasResumeTrack: true,
                  shortDescription: 'This enrollment is missing course metadata. Reload after syncing the catalog.',
                  description: '',
                  highlights: [],
                  outcomes: [],
                  sortOrder: idx + 1,
                  isActive: true,
                } as any;
                const batchName = ((d as any)?.batch?.name as any) || activeBatch || 'BATCH';

                return (
                  <DivisionCard
                    key={e._id || `${e._divisionId}:${idx}`}
                    division={d || fallback}
                    index={idx}
                    action={
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                          Enrolled {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '—'}
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                          {batchName}
                        </div>
                      </div>
                    }
                  />
                );
              })}
              {!loading && !(me?.enrollments || []).length && (
                <div className="text-slate-400 font-medium">No enrollments yet. Enroll in courses from your batch.</div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] border-white/10 p-8">
            <div className="flex items-end justify-between gap-6 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Available Courses</h2>
                <p className="text-slate-400 font-medium mt-2 text-sm">More detail, better clarity — built to convert effort into outcomes.</p>
              </div>
              {activeBatch && (
                <div className="px-4 py-2 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-200 text-[10px] font-black uppercase tracking-[0.35em]">
                  Batch {activeBatch}
                </div>
              )}
            </div>

            {loadingCourses ? (
              <div className="text-slate-400 font-medium">Loading courses...</div>
            ) : !activeBatch ? (
              <div className="text-slate-400 font-medium">Buy a plan to unlock a batch and start enrolling.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {availableCourses.map((c, idx) => (
                  <DivisionCard
                    key={c._id}
                    division={c}
                    index={idx}
                    action={
                      <button
                        disabled={enrolling === c._id}
                        onClick={() => void handleEnroll(c._id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                      >
                        {enrolling === c._id ? 'Enrolling...' : 'Enroll Now'}
                      </button>
                    }
                  />
                ))}
                {!availableCourses.length && (
                  <div className="text-slate-400 font-medium">You're enrolled in everything available for your batch.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

