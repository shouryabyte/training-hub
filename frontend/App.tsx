import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { AdminWorkspace } from './pages/AdminWorkspace';
import { TeacherWorkspace } from './pages/TeacherWorkspace';
import { WorkspaceRedirect } from './pages/WorkspaceRedirect';
import { AiLabsPage } from './pages/AiLabsPage';
import { PlansPage } from './pages/PlansPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SiteLayout } from './components/SiteLayout';
import { AdminLayout } from './components/AdminLayout';
import { TeacherLayout } from './components/TeacherLayout';
import { HomePage } from './pages/HomePage';
import { AlphaPage } from './pages/AlphaPage';
import { DeltaPage } from './pages/DeltaPage';
import { DashboardPage } from './pages/DashboardPage';
import { PolicyPage } from './pages/PolicyPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutResultPage } from './pages/CheckoutResultPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminWorkspace />} />
          </Route>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher" element={<TeacherWorkspace />} />
          </Route>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/alpha" element={<AlphaPage />} />
            <Route path="/delta" element={<DeltaPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/ai-labs" element={<AiLabsPage />} />
            <Route path="/plans" element={<PlansPage />} />

            <Route path="/about" element={<PolicyPage kind="about" />} />
            <Route path="/privacy" element={<PolicyPage kind="privacy" />} />
            <Route path="/terms" element={<PolicyPage kind="terms" />} />
            <Route path="/refund" element={<PolicyPage kind="refund" />} />
            <Route path="/contact" element={<PolicyPage kind="contact" />} />
            <Route path="/support" element={<PolicyPage kind="support" />} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute role="STUDENT">
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/result"
              element={
                <ProtectedRoute role="STUDENT">
                  <CheckoutResultPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="STUDENT">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route path="/workspace" element={<WorkspaceRedirect />} />
            <Route path="/student" element={<Navigate to="/dashboard" replace />} />

            <Route path="/auth" element={<AuthPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
