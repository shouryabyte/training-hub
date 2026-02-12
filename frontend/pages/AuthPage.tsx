import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Auth } from '../components/Auth';
import { Category } from '../types';
import { useAuth } from '../context/AuthContext';

function homeForRole(role: string | undefined | null) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TEACHER') return '/teacher';
  return '/dashboard';
}

function isReturnToAllowedForRole(role: string | undefined | null, path: string) {
  if (!path || !path.startsWith('/')) return false;
  if (role === 'ADMIN') return path === '/admin' || path.startsWith('/admin/');
  if (role === 'TEACHER') return path === '/teacher' || path.startsWith('/teacher/');
  // students
  return (
    path === '/workspace' ||
    path === '/student' ||
    path.startsWith('/dashboard') ||
    path.startsWith('/checkout') ||
    path.startsWith('/plans') ||
    path.startsWith('/alpha') ||
    path.startsWith('/delta')
  );
}

export const AuthPage: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const { isReady, token, user } = useAuth();
  const q = new URLSearchParams(loc.search);
  const returnTo = q.get('returnTo');
  const safeReturnTo = returnTo && returnTo.startsWith('/') ? returnTo : '/workspace';

  if (isReady && token) {
    const role = user?.role || null;
    const dest = isReturnToAllowedForRole(role, safeReturnTo) ? safeReturnTo : homeForRole(role);
    return <Navigate to={dest} replace />;
  }

  const handleSuccess = ({ category, user }: { category: Category; user: { role?: string | null } }) => {
    try {
      localStorage.setItem('user_category', category);
    } catch {
      // ignore
    }

    const role = user?.role || null;
    const dest = isReturnToAllowedForRole(role, safeReturnTo) ? safeReturnTo : homeForRole(role);
    nav(dest, { replace: true });
  };

  return <Auth onSuccess={handleSuccess} onBack={() => nav('/')} />;
};
