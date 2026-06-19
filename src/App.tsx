import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './styles/globals.css';

// Pages — lazy loaded for performance
const LandingPage    = React.lazy(() => import('./pages/LandingPage'));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));
const DashboardPage  = React.lazy(() => import('./pages/DashboardPage'));
const DailyPlanPage  = React.lazy(() => import('./pages/DailyPlanPage'));
const WeeklyPlanPage = React.lazy(() => import('./pages/WeeklyPlanPage'));
const ReflectionPage = React.lazy(() => import('./pages/ReflectionPage'));
const SignInPage      = React.lazy(() => import('./pages/SignInPage'));
const AdminPage       = React.lazy(() => import('./pages/AdminPage'));

// Route guard — redirect to sign in if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--ivory)', color:'var(--mist)', fontFamily:'var(--ff-body)' }}>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

// Route guard — redirect to dashboard if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <React.Suspense fallback={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--ivory)' }}>
            <div style={{ fontFamily:'var(--ff-display)', fontSize:'1.5rem', color:'var(--ink)' }}>
              Mission<span style={{ color:'var(--gold)' }}>ly</span>
            </div>
          </div>
        }>
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

            {/* Protected app */}
            <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/daily-plan"  element={<ProtectedRoute><DailyPlanPage /></ProtectedRoute>} />
            <Route path="/weekly-plan" element={<ProtectedRoute><WeeklyPlanPage /></ProtectedRoute>} />
            <Route path="/reflection"  element={<ProtectedRoute><ReflectionPage /></ProtectedRoute>} />
            <Route path="/admin"       element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
