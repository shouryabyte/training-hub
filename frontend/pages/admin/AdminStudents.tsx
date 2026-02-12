import React, { useMemo, useState } from 'react';
import { AdminDashboard } from '../../services/adminService';

function formatInrPaise(amountPaise?: number) {
  if (!amountPaise || !Number.isFinite(Number(amountPaise))) return '—';
  return `₹${(Number(amountPaise) / 100).toLocaleString()}`;
}

export const AdminStudents: React.FC<{ data: AdminDashboard | null; loading: boolean }> = ({ data, loading }) => {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const all = data?.students || [];
    if (!query) return all;
    return all.filter((s) => String(s.name).toLowerCase().includes(query) || String(s.email).toLowerCase().includes(query));
  }, [data, q]);

  return (
    <div className="glass-card rounded-[2.5rem] border-white/10 p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Students</h2>
          <p className="text-slate-400 font-medium mt-2">Read-only view: batch, purchase, validity, and enrolled courses.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full md:w-96 bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
          placeholder="Search by name or email…"
        />
      </div>

      <div className="space-y-4">
        {rows.map((s) => (
          <div key={s.id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-white font-black text-lg tracking-tight">{s.name}</p>
                <p className="text-slate-500 text-sm font-medium">{s.email}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    {s.batch?.name ? `Batch ${s.batch.name}` : 'No batch'}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Enrollments {s.enrollments}</span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    {s.latestPurchase?.planTitle ? s.latestPurchase.planTitle : 'No plan'}
                  </span>
                </div>
                {(s.enrolledCourses || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(s.enrolledCourses || []).slice(0, 6).map((c) => (
                      <span
                        key={c.id}
                        className="px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-200 text-[10px] font-black uppercase tracking-widest"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {s.latestPurchase?.amount ? `Paid ${formatInrPaise(s.latestPurchase.amount)}` : '—'}
                </div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  {s.latestPurchase?.validUntil ? `Valid until ${new Date(s.latestPurchase.validUntil).toLocaleDateString()}` : ''}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && !rows.length && <div className="text-slate-400 font-medium">No students yet.</div>}
      </div>
    </div>
  );
};

