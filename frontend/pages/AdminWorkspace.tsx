import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard, getAdminDashboard } from '../services/adminService';
import { AdminOverview } from './admin/AdminOverview';
import { AdminStudents } from './admin/AdminStudents';
import { AdminCourses } from './admin/AdminCourses';
import { AdminUsers } from './admin/AdminUsers';
import { AdminTeachers } from './admin/AdminTeachers';
import { AdminProjects } from './admin/AdminProjects';

type AdminLoadError = {
  title: string;
  message: string;
  status?: number;
};

export const AdminWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AdminLoadError | null>(null);

  const title = useMemo(() => (user?.name ? `Admin Dashboard - ${user.name}` : 'Admin Dashboard'), [user?.name]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getAdminDashboard();
      setData(d);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      if (status === 404) {
        setError({
          title: 'Admin API not found (404)',
          message: 'Your backend is running, but it does not have the `/api/admin/dashboard` endpoint. Restart the backend and ensure your code is up to date.',
          status,
        });
      } else if (status === 401) {
        setError({
          title: 'Session expired (401)',
          message: 'Please sign in again.',
          status,
        });
      } else if (status === 403) {
        setError({
          title: 'Access denied (403)',
          message: 'This account is not allowed to access the admin dashboard.',
          status,
        });
      } else {
        setError({
          title: 'Failed to load dashboard',
          message: e?.data?.message || e?.message || 'Network error (is the backend running?)',
          status,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">Control Plane</p>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{title}</h1>
            <p className="text-slate-400 mt-3 font-medium">
              Admin analytics and account management. Course creation and edits are handled by Teachers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#overview"
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            >
              Overview
            </a>
            <a
              href="#accounts"
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            >
              Accounts
            </a>
            <a
              href="#courses"
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            >
              Courses
            </a>
            <a
              href="#projects"
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            >
              Projects
            </a>
            <a
              href="#students"
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            >
              Students
            </a>
            <a
              href="#teachers"
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            >
              Teachers
            </a>
            <button
              onClick={() => void refresh()}
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
            >
              {loading ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="glass-card rounded-[2.5rem] border border-red-500/20 bg-red-950/10 p-8 mb-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <p className="mono text-[10px] font-black text-red-300 uppercase tracking-[0.4em] mb-3">Admin Load Error</p>
                <h2 className="text-2xl font-black text-white tracking-tight">{error.title}</h2>
                <p className="text-slate-300 font-medium mt-3">{error.message}</p>
                <div className="mt-4 text-xs text-slate-400 font-medium">
                  Endpoint: <span className="mono text-slate-200">/api/admin/dashboard</span>
                  {typeof error.status === 'number' ? <span className="ml-3">HTTP {error.status}</span> : null}
                </div>
              </div>
              <button
                onClick={() => void refresh()}
                className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <section id="overview" className="scroll-mt-28">
          <AdminOverview data={data} loading={loading} />
        </section>

        <section id="accounts" className="scroll-mt-28 mt-10">
          {data?.batches?.length ? (
            <AdminUsers batches={data.batches} />
          ) : (
            <div className="glass-card rounded-[2.5rem] border-white/10 p-8 text-slate-400 font-medium">
              Account management is unavailable until the dashboard loads batches.
            </div>
          )}
        </section>

        <section id="courses" className="scroll-mt-28 mt-10">
          {data?.batches?.length ? (
            <AdminCourses batches={data.batches} />
          ) : (
            <div className="glass-card rounded-[2.5rem] border-white/10 p-8 text-slate-400 font-medium">
              Courses are unavailable until the dashboard loads batches.
            </div>
          )}
        </section>

        <section id="projects" className="scroll-mt-28 mt-10">
          <AdminProjects />
        </section>

        <section id="students" className="scroll-mt-28 mt-10">
          <AdminStudents data={data} loading={loading} />
        </section>

        <section id="teachers" className="scroll-mt-28 mt-10">
          <AdminTeachers data={data} loading={loading} />
        </section>
      </div>
    </div>
  );
};
