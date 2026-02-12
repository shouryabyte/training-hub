import React from 'react';
import { AdminDashboard } from '../../services/adminService';

function formatInrPaise(amountPaise: number | undefined) {
  if (!amountPaise || !Number.isFinite(Number(amountPaise))) return '-';
  const rupees = Number(amountPaise) / 100;
  return `₹${rupees.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export const AdminOverview: React.FC<{ data: AdminDashboard | null; loading: boolean }> = ({ data, loading }) => {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-1">
        <h2 className="text-2xl font-black text-white tracking-tight mb-6">KPIs</h2>
        <div className="space-y-4">
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Students</p>
            <p className="text-white font-black text-3xl mt-2 tabular-nums">{data?.stats?.students ?? '-'}</p>
          </div>
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Teachers</p>
            <p className="text-white font-black text-3xl mt-2 tabular-nums">{data?.stats?.teachers ?? '-'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Courses (active)</p>
              <p className="text-white font-black text-2xl mt-2 tabular-nums">{data?.stats?.coursesActive ?? '-'}</p>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Courses (total)</p>
              <p className="text-white font-black text-2xl mt-2 tabular-nums">{data?.stats?.coursesTotal ?? '-'}</p>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Revenue (Paid)</p>
            <p className="text-white font-black text-3xl mt-2 tabular-nums">{formatInrPaise(data?.stats?.revenue)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Paid customers</p>
              <p className="text-white font-black text-2xl mt-2 tabular-nums">{data?.stats?.paidCustomers ?? '-'}</p>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active subscribers</p>
              <p className="text-white font-black text-2xl mt-2 tabular-nums">{data?.stats?.activeSubscribers ?? '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Paid purchases</p>
              <p className="text-white font-black text-2xl mt-2 tabular-nums">{data?.stats?.paidPurchases ?? '-'}</p>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total enrollments</p>
              <p className="text-white font-black text-2xl mt-2 tabular-nums">{data?.stats?.totalEnrollments ?? '-'}</p>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Students by batch</p>
            <div className="mt-3 space-y-2">
              {Object.entries(data?.stats?.byBatch || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-slate-300 text-sm font-bold">
                  <span>{k}</span>
                  <span className="text-white font-black tabular-nums">{v}</span>
                </div>
              ))}
              {!loading && !Object.keys(data?.stats?.byBatch || {}).length && (
                <div className="text-slate-500 text-sm font-medium">No data yet.</div>
              )}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Courses by batch</p>
            <div className="mt-3 space-y-2">
              {Object.entries(data?.stats?.coursesByBatch || {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-slate-300 text-sm font-bold">
                  <span>{k}</span>
                  <span className="text-white font-black tabular-nums">
                    {v.active}/{v.total}
                  </span>
                </div>
              ))}
              {!loading && !Object.keys(data?.stats?.coursesByBatch || {}).length && (
                <div className="text-slate-500 text-sm font-medium">No data yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/10 p-8 lg:col-span-2">
        <h2 className="text-2xl font-black text-white tracking-tight mb-6">Recent Purchases</h2>
        <div className="space-y-4">
          {(data?.recentPurchases || []).map((p: any) => (
            <div key={p._id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-white font-black">{p.planId?.title || p.planId?.key || 'Plan'}</p>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">
                    {p.batchId?.name ? `Batch ${p.batchId.name}` : 'Batch —'} • {String(p.provider || '').toUpperCase()} • {p.status}
                  </p>
                </div>
                <div className="text-slate-300 text-sm font-bold">{formatInrPaise(p.amount)}</div>
              </div>
            </div>
          ))}
          {!loading && !(data?.recentPurchases || []).length && <div className="text-slate-400 font-medium">No purchases yet.</div>}
        </div>
      </div>
    </div>
  );
};
