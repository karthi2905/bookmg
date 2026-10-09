import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import AppShell from './layouts/AppShell';
import PageLoader from './components/PageLoader';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Animated glowing progress bar on route and tab transitions */}
        <PageLoader />

        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Landing />
              </PublicLayout>
            }
          />

          {/* Dedicated Auth Routes */}
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          {/* Internal Workspace App Routes (under /app/* with Sidebar Shell) */}
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/app/dashboard" element={<AppShell activeTab="dashboard" />} />
          <Route path="/app/resources" element={<AppShell activeTab="resources" />} />
          <Route path="/app/catalog" element={<Navigate to="/app/resources" replace />} />
          <Route path="/app/calendar" element={<AppShell activeTab="calendar" />} />
          <Route path="/app/bookings" element={<AppShell activeTab="bookings" />} />
          <Route path="/app/approvals" element={<AppShell activeTab="approvals" />} />
          <Route path="/app/reports" element={<AppShell activeTab="reports" />} />

          {/* Catch-all redirect to public landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
