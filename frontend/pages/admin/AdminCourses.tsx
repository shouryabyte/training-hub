import React, { useEffect, useMemo, useState } from 'react';
import { Course, listCourses } from '../../services/adminService';

export const AdminCourses: React.FC<{ batches: any[] }> = ({ batches }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batchId, setBatchId] = useState('');
  const [q, setQ] = useState('');

  const refresh = async (bId?: string) => {
    setLoading(true);
    try {
      const data = await listCourses(bId);
      setCourses(data);
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const first = batches?.[0]?._id || '';
    setBatchId(first);
    void refresh(first);
  }, [batches]);

  const filtered = useMemo(() => {
    const base = batchId
      ? courses.filter((c) => String((c as any).batch?._id || (c as any).batch) === String(batchId))
      : courses;
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((c) => String(c.name).toLowerCase().includes(query) || String(c.slug || '').toLowerCase().includes(query));
  }, [courses, batchId, q]);

  return (
    <div className="glass-card rounded-[2.5rem] border-white/10 p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Courses</h2>
          <p className="text-slate-400 font-medium mt-2">Read-only view. Course creation and edits are handled by Teachers.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={batchId}
            onChange={(e) => {
              const id = e.target.value;
              setBatchId(id);
              void refresh(id);
            }}
            className="w-full sm:w-48 bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold"
          >
            {(batches || []).map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-72 bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
            placeholder="Search courses…"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((c) => (
          <div key={c._id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="text-white font-black text-lg tracking-tight">{c.name}</div>
                {c.shortDescription ? <div className="mt-2 text-slate-300 text-sm font-medium">{c.shortDescription}</div> : null}
                {c.slug ? <div className="mt-3 mono text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">/{c.slug}</div> : null}
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <span className={`px-3 py-1.5 rounded-full border ${c.isActive !== false ? 'border-emerald-500/20 bg-emerald-600/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                  {c.isActive !== false ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {!loading && !filtered.length && <div className="text-slate-400 font-medium">No courses yet.</div>}
      </div>
    </div>
  );
};

