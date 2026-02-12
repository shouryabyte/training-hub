import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const WorkspaceRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'TEACHER') return <Navigate to="/teacher" replace />;
  return <Navigate to="/dashboard" replace />;
};
