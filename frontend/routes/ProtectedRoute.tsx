import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { decodeJwt } from '../utils/jwt';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'ADMIN' | 'TEACHER' | 'STUDENT' }> = ({ children, role }) => {
  const { token, user, isReady } = useAuth();
  const loc = useLocation();

  if (!isReady) return null;
  if (!token) {
    const returnTo = encodeURIComponent(`${loc.pathname}${loc.search || ''}`);
    return <Navigate to={`/auth?returnTo=${returnTo}`} replace />;
  }
  const effectiveRole = user?.role || decodeJwt(token)?.role;
  if (role && effectiveRole !== role) {
    const to = effectiveRole === 'ADMIN' ? '/admin' : effectiveRole === 'TEACHER' ? '/teacher' : '/dashboard';
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
};
