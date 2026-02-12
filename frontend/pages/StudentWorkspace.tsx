import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getDivisions, enrollDivision, getMyEnrollments, Division, Enrollment } from '../services/studentService';

export const StudentWorkspace: React.FC = () => {
  const { logout, user } = useAuth();
  const nav = useNavigate();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<'divisions' | 'enrollments'>('divisions');

  const title = useMemo(() => (user?.name ? `Welcome, ${user.name}` : 'Student Workspace'), [user?.name]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [d, e] = await Promise.all([getDivisions(), getMyEnrollments()]);
      setDivisions(d);
      setEnrollments(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleEnroll = async (divisionId: string) => {
    try {
      await enrollDivision(divisionId);
      await refresh();
    } catch (e: any) {
      window.alert(e?.data?.message || e?.message || 'Enroll failed');
    }
  };

  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white bg-[#020617]">
      <Navbar
        onLogoClick={() => nav('/')}
        isLoggedIn
        onLogout={() => void logout()}
        onDashboardClick={() => nav('/student')}
      />

      <div className="pt-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <p className="mono text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">AI Command Center</p>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{title}</h1>
              <p className="text-slate-400 mt-3 font-medium">Browse divisions, enroll, and track your progress.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActive('divisions')}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                  active === 'divisions' ? 'bg-indigo-600 text-white border-indigo-500/30' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                Divisions
              </button>
              <button
                onClick={() => setActive('enrollments')}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                  active === 'enrollments' ? 'bg-indigo-600 text-white border-indigo-500/30' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                My Enrollments
              </button>
              <button
                onClick={() => void refresh()}
                className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                {loading ? 'Syncing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {active === 'divisions' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {divisions.map((d) => (
                <div key={d._id} className="glass-card rounded-[2rem] border-white/10 p-8 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]"></div>
                  <p className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">
                    Batch {d.batch?.name || '—'}
                  </p>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">{d.name}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-8">
                    Resume Track: <span className="text-slate-300">{d.hasResumeTrack ? 'Enabled' : 'Disabled'}</span>
                  </p>
                  <button
                    onClick={() => handleEnroll(d._id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    Enroll
                  </button>
                </div>
              ))}
              {!loading && divisions.length === 0 && (
                <div className="text-slate-400 font-medium">No divisions found. Ask a teacher to create one.</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((e) => (
                <div key={e._id} className="glass-card rounded-[2rem] border-white/10 p-6 flex items-center justify-between">
                  <div>
                    <p className="mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">
                      Batch {e.division?.batch?.name || '—'}
                    </p>
                    <p className="text-white font-black text-lg tracking-tight">{e.division?.name || 'Division'}</p>
                  </div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {!loading && enrollments.length === 0 && (
                <div className="text-slate-400 font-medium">No enrollments yet. Enroll in a division to begin.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
