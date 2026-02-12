import React, { useMemo, useState } from 'react';
import { AdminDashboard } from '../../services/adminService';

export const AdminTeachers: React.FC<{ data: AdminDashboard | null; loading: boolean }> = ({ data, loading }) => {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const all = data?.teachers || [];
    if (!query) return all;
    return all.filter((t) => String(t.name).toLowerCase().includes(query) || String(t.email).toLowerCase().includes(query));
  }, [data, q]);

  return (
    <div className="glass-card rounded-[2.5rem] border-white/10 p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Teachers</h2>
          <p className="text-slate-400 font-medium mt-2">Read-only view: account + course counts.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full md:w-96 bg-slate-950/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium"
          placeholder="Search by name or email…"
        />
      </div>

      <div className="space-y-4">
        {rows.map((t) => (
          <div key={t.id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-white font-black text-lg tracking-tight">{t.name}</p>
                <p className="text-slate-500 text-sm font-medium">{t.email}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Courses {t.coursesTotal}</span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Active {t.coursesActive}</span>
                </div>
              </div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {t.createdAt ? `Created ${new Date(t.createdAt).toLocaleDateString()}` : ''}
              </div>
            </div>
          </div>
        ))}
        {!loading && !rows.length && <div className="text-slate-400 font-medium">No teachers yet.</div>}
      </div>
    </div>
  );
};

