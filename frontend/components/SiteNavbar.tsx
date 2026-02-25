import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function encodeReturnTo(pathname: string, search: string) {
  const p = `${pathname}${search || ''}`;
  return encodeURIComponent(p || '/');
}

export const SiteNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 ${
        scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
            N
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-white">
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

          <div className="flex items-center gap-3 sm:gap-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to={`/auth?returnTo=${returnTo}`}
                  className="hidden sm:block text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest mr-2 sm:mr-4"
                >
                  Sign In
                </Link>
                <Link
                  to={`/auth?returnTo=${encodeURIComponent('/dashboard')}`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 sm:px-8 py-3 rounded-2xl transition-all font-black text-xs sm:text-sm tracking-widest uppercase shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    void (async () => {
                      await logout();
                      nav('/', { replace: true });
                    })()
                  }
                  className="hidden sm:block text-slate-400 hover:text-red-400 font-bold text-sm uppercase tracking-widest mr-2 sm:mr-4 transition-colors"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => nav(user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/dashboard')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 sm:px-8 py-3 rounded-2xl transition-all font-black text-xs sm:text-sm tracking-widest uppercase shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  Dashboard
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-4 glass-card border-white/10 bg-slate-950/70 backdrop-blur-xl rounded-[2rem] p-4">
            <div className="grid gap-2 text-sm font-bold tracking-widest uppercase">
              <Link to="/#batches" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl text-slate-300 hover:bg-white/5">
                Programs
              </Link>
              <Link to="/ai-labs" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl text-slate-300 hover:bg-white/5">
                AI Labs
              </Link>
              <Link to="/plans" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl text-slate-300 hover:bg-white/5">
                Plans
              </Link>
              <Link to="/projects" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl text-slate-300 hover:bg-white/5">
                Projects
              </Link>
              {!isLoggedIn ? (
                <Link
                  to={`/auth?returnTo=${returnTo}`}
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 px-4 py-3 rounded-2xl text-white bg-indigo-600 hover:bg-indigo-500 text-center"
                >
                  Sign In
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void (async () => {
                      setMobileOpen(false);
                      await logout();
                      nav('/', { replace: true });
                    })()
                  }
                  className="mt-2 px-4 py-3 rounded-2xl text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-center"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
