import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function encodeReturnTo(pathname: string, search: string) {
  const p = `${pathname}${search || ''}`;
  return encodeURIComponent(p || '/');
}

export const SiteNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const { token, logout, user } = useAuth();

  const isLoggedIn = Boolean(token);
  const returnTo = useMemo(() => encodeReturnTo(loc.pathname, loc.search), [loc.pathname, loc.search]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 ${
        scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
            N
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            NEX<span className="text-indigo-400">CHAKRA</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-sm font-bold tracking-widest uppercase">
          <Link to="/#batches" className="text-slate-400 hover:text-white transition-colors relative group">
            Programs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/ai-labs" className="text-slate-400 hover:text-white transition-colors relative group">
            AI Labs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/plans" className="text-slate-400 hover:text-white transition-colors relative group">
            Plans
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/projects" className="text-slate-400 hover:text-white transition-colors relative group">
            Projects
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                to={`/auth?returnTo=${returnTo}`}
                className="hidden sm:block text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest mr-4"
              >
                Sign In
              </Link>
              <Link
                to={`/auth?returnTo=${encodeURIComponent('/dashboard')}`}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl transition-all font-black text-sm tracking-widest uppercase shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => void (async () => {
                  await logout();
                  nav('/', { replace: true });
                })()}
                className="hidden sm:block text-slate-400 hover:text-red-400 font-bold text-sm uppercase tracking-widest mr-4 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={() => nav(user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl transition-all font-black text-sm tracking-widest uppercase shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
