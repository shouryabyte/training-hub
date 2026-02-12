import React, { useEffect, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { SiteNavbar } from './SiteNavbar';
import { SiteFooter } from './SiteFooter';
import { useAuth } from '../context/AuthContext';
import { decodeJwt } from '../utils/jwt';

export const SiteLayout: React.FC = () => {
  const loc = useLocation();
  const { isReady, token, user } = useAuth();
  const role = useMemo(() => user?.role || (token ? decodeJwt(token)?.role : null), [user?.role, token]);

  // Always call hooks; guard inside to avoid hook-order issues on auth transitions.
  useEffect(() => {
    const id = (loc.hash || '').replace(/^#/, '');
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loc.hash]);

  const staffWorkspace = role === 'ADMIN' ? '/admin' : role === 'TEACHER' ? '/teacher' : null;
  const shouldRedirectStaffToWorkspace =
    Boolean(staffWorkspace) && (loc.pathname === '/' || loc.pathname === '/student' || loc.pathname === '/dashboard');

  if (isReady && loc.pathname !== '/auth' && shouldRedirectStaffToWorkspace && staffWorkspace) {
    return <Navigate to={staffWorkspace} replace />;
  }

  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white bg-[#020617]">
      <SiteNavbar />
      <main className="pt-28">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};
