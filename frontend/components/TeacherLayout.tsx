import React, { useEffect, useMemo } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { decodeJwt } from '../utils/jwt';

export const TeacherLayout: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, token, isReady, logout } = useAuth();

  const role = useMemo(() => user?.role || (token ? decodeJwt(token)?.role : null), [user?.role, token]);

  useEffect(() => {
    const id = (loc.hash || '').replace(/^#/, '');
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loc.hash]);

  const handleSignOut = async () => {
    await logout();
    nav('/', { replace: true });
  };

  if (!isReady) return null;
  if (!token) return <Navigate to={`/auth?returnTo=${encodeURIComponent('/teacher')}`} replace />;
  if (role !== 'TEACHER') return <Navigate to={role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;

  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white bg-[#020617]">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => nav('/teacher')}
            className="flex items-center gap-3 group cursor-pointer"
            aria-label="Teacher workspace"
          >
            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
              N
            </div>
            <div className="leading-tight text-left">
              <div className="text-lg font-black tracking-tighter text-white">
                NEX<span className="text-indigo-400">CHAKRA</span>
              </div>
              <div className="mono text-[10px] font-black text-indigo-300 uppercase tracking-[0.35em]">Teacher Console</div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-black text-white leading-tight">{user?.name || 'Teacher'}</div>
              <div className="text-[11px] text-slate-400 font-medium">{user?.email || ''}</div>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-slate-500 flex items-center justify-between">
          <span>(c) {new Date().getFullYear()} Nexchakra</span>
          <span className="mono uppercase tracking-[0.35em]">v1 | {loc.pathname}</span>
        </div>
      </footer>
    </div>
  );
};
