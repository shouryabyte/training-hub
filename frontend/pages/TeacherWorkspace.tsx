import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listBatches } from '../services/teacherService';
import { TeacherCourses } from './teacher/TeacherCourses';

type TeacherLoadError = {
  title: string;
  message: string;
  status?: number;
};

export const TeacherWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TeacherLoadError | null>(null);

  const title = useMemo(() => (user?.name ? `Teacher Workspace - ${user.name}` : 'Teacher Workspace'), [user?.name]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const b = await listBatches();
      setBatches(b || []);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      if (status === 401) {
        setError({ title: 'Session expired (401)', message: 'Please sign in again.', status });
      } else if (status === 403) {
        setError({ title: 'Access denied (403)', message: 'This account is not allowed to access the teacher workspace.', status });
      } else {
        setError({ title: 'Failed to load workspace', message: e?.data?.message || e?.message || 'Network error (is the backend running?)', status });
      }
      setBatches([]);
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
            <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">Content Plane</p>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{title}</h1>
            <p className="text-slate-400 mt-3 font-medium">Manage your courses. Changes appear instantly for students.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#courses"
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            >
              Courses
            </a>
            <button
              onClick={() => void refresh()}
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
              {loading ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="glass-card rounded-[2.5rem] border border-red-500/20 bg-red-950/10 p-8 mb-10">
            <h2 className="text-2xl font-black text-white tracking-tight">{error.title}</h2>
            <p className="text-slate-300 font-medium mt-3">{error.message}</p>
          </div>
        )}

        <section id="courses" className="scroll-mt-28">
          {batches?.length ? (
            <TeacherCourses batches={batches} />
          ) : (
            <div className="glass-card rounded-[2.5rem] border-white/10 p-8 text-slate-400 font-medium">
              {loading ? 'Loading batches…' : 'Courses are unavailable until batches load.'}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

