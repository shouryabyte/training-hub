import React, { useEffect, useMemo, useState } from 'react';
import { Course, ProgramPlan, createPlan, deletePlan, listCourses, listPlans, updatePlan } from '../../services/adminService';

function formatInrPaise(amountPaise: number | undefined) {
  if (!amountPaise || !Number.isFinite(Number(amountPaise))) return '—';
  const rupees = Number(amountPaise) / 100;
  return `₹${rupees.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export const AdminPlans: React.FC<{ batches: any[] }> = ({ batches }) => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [plans, setPlans] = useState<ProgramPlan[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [batchId, setBatchId] = useState('');
  const [draft, setDraft] = useState({
    key: '',
    title: '',
    includedDivisions: [] as string[],
    durationLabel: '',
    durationDays: '' as string,
    priceRupees: '' as string,
    isActive: true,
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([listPlans(), listCourses()]);
      setPlans(p as any);
      setCourses(c as any);
      const first = batches?.[0]?._id || '';
      setBatchId((x) => x || first);
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [batches]);

  const divisionsForBatch = useMemo(() => {
    if (!batchId) return [];
    return courses.filter((c) => String((c as any).batch?._id || (c as any).batch) === String(batchId));
  }, [courses, batchId]);

  const toggleDivision = (id: string) => {
    setDraft((x) => {
      const set = new Set(x.includedDivisions);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...x, includedDivisions: Array.from(set) };
    });
  };

  const create = async () => {
    const amount = Math.round(Number(draft.priceRupees || '0') * 100);
    if (!batchId || !draft.key.trim() || !draft.title.trim() || amount <= 0) return;
    setBusy('create');
    try {
      await createPlan({
        key: draft.key.trim(),
        title: draft.title.trim(),
        batch: batchId,
        includedDivisions: draft.includedDivisions,
        durationLabel: draft.durationLabel.trim(),
        durationDays: draft.durationDays ? Number(draft.durationDays) : null,
        currency: 'INR',
        amount,
        isActive: draft.isActive,
        metadata: {},
      } as any);
      setDraft({
        key: '',
        title: '',
        includedDivisions: [],
        durationLabel: '',
        durationDays: '',
        priceRupees: '',
        isActive: true,
      });
      await refresh();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Create plan failed');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this plan?')) return;
    setBusy(`del:${id}`);
    try {
      await deletePlan(id);
      await refresh();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Delete plan failed');
    } finally {
      setBusy(null);
    }
  };

  const resave = async (p: any) => {
    setBusy(p._id);
    try {
      await updatePlan(p._id, {
        key: p.key,
        title: p.title,
        batch: String(p.batch?._id || p.batch),
        includedDivisions: (p.includedDivisions || []).map((d: any) => String(d?._id || d)),
        durationLabel: p.durationLabel || '',
        durationDays: p.durationDays ?? null,
        currency: p.currency || 'INR',
        amount: p.amount,
        isActive: p.isActive !== false,
        metadata: p.metadata || {},
      } as any);
      await refresh();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Update plan failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
        <h2 className="text-2xl font-black text-white tracking-tight mb-6">Create Plan</h2>
        <div className="space-y-4">
          <select
            value={batchId}
            onChange={(e) => {
              setBatchId(e.target.value);
              setDraft((x) => ({ ...x, includedDivisions: [] }));
            }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold uppercase tracking-widest text-xs"
          >
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            value={draft.key}
            onChange={(e) => setDraft((x) => ({ ...x, key: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Plan key (alpha-foundation)"
          />
          <input
            value={draft.title}
            onChange={(e) => setDraft((x) => ({ ...x, title: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Plan title"
          />
          <input
            value={draft.durationLabel}
            onChange={(e) => setDraft((x) => ({ ...x, durationLabel: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Duration label (e.g., 3 months)"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={draft.durationDays}
              onChange={(e) => setDraft((x) => ({ ...x, durationDays: e.target.value }))}
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
              placeholder="Days"
            />
            <input
              value={draft.priceRupees}
              onChange={(e) => setDraft((x) => ({ ...x, priceRupees: e.target.value }))}
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold"
              placeholder="Price (₹)"
            />
          </div>
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Included courses</p>
            <div className="space-y-2 max-h-48 overflow-auto">
              {divisionsForBatch.map((d) => (
                <label key={d._id} className="flex items-center justify-between gap-3 text-slate-300 text-sm font-medium">
                  <span>{d.name}</span>
                  <input
                    type="checkbox"
                    checked={draft.includedDivisions.includes(d._id)}
                    onChange={() => toggleDivision(d._id)}
                    className="h-4 w-4 accent-indigo-500"
                  />
                </label>
              ))}
              {!divisionsForBatch.length && <div className="text-slate-500 text-sm">No courses for this batch yet.</div>}
            </div>
          </div>

          <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-xs uppercase tracking-widest">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft((x) => ({ ...x, isActive: e.target.checked }))}
              className="h-4 w-4 accent-indigo-500"
            />
            Active
          </label>

          <button
            disabled={busy === 'create' || !draft.key.trim() || !draft.title.trim()}
            onClick={() => void create()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            {busy === 'create' ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-2">
        <h2 className="text-2xl font-black text-white tracking-tight mb-6">Plans</h2>
        <div className="space-y-4">
          {plans.map((p: any) => (
            <div key={p._id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-black text-lg">{p.title}</p>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">
                    {p.key} • Batch {p.batch?.name || '—'} • {formatInrPaise(p.amount)} • {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </p>
                  <p className="text-slate-300 text-sm font-medium mt-3">
                    Includes {(p.includedDivisions || []).length} course(s) • {p.durationLabel || '—'}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    disabled={busy === p._id}
                    onClick={() => void resave(p)}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    {busy === p._id ? 'Saving...' : 'Re-save'}
                  </button>
                  <button
                    disabled={busy === `del:${p._id}`}
                    onClick={() => void remove(p._id)}
                    className="bg-white/5 hover:bg-red-600/20 text-red-200 border border-red-500/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && !plans.length && <div className="text-slate-400 font-medium">No plans found.</div>}
        </div>
      </div>
    </div>
  );
};
