import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ToastContainer from './components/ToastContainer';
import AppLayout from './components/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import HackathonsPage from './pages/HackathonsPage';
import HackathonDetailPage from './pages/HackathonDetailPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import SmartFormationPage from './pages/SmartFormationPage';
import MentorsPage from './pages/MentorsPage';
import MentorDetailPage from './pages/MentorDetailPage';
import MentorDashboard from './pages/MentorDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DdbmsDemoPage from './pages/DdbmsDemoPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--color-olive-700)', fontWeight: 600 }}>Loading HackBridge...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public Top-Level Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Layout for Application Shell */}
          <Route element={<AppLayout />}>
            {/* Student Dash & Profile */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Mentor Portal */}
            <Route
              path="/mentor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['mentor', 'admin']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />

            {/* College Organizer Portal */}
            <Route
              path="/organizer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['college', 'admin']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Console */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Platform Modules (Accessible authenticated or direct) */}
            <Route path="/hackathons" element={<HackathonsPage />} />
            <Route path="/hackathons/:id" element={<HackathonDetailPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/smart-formation" element={<SmartFormationPage />} />
            <Route path="/mentors" element={<MentorsPage />} />
            <Route path="/mentors/:id" element={<MentorDetailPage />} />
            <Route path="/ddbms" element={<DdbmsDemoPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
