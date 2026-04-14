import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import PageLoader from './components/PageLoader';
import ReloadPrompt from './components/ReloadPrompt';

// Lazy load modules
const Login = lazy(() => import('./modules/auth/Login'));
const Register = lazy(() => import('./modules/auth/Register'));
const Dashboard = lazy(() => import('./modules/dashboard/Dashboard'));
const Tracker = lazy(() => import('./modules/tracker/Tracker'));
const Analytics = lazy(() => import('./modules/analytics/Analytics'));
const Mistakes = lazy(() => import('./modules/mistakes/Mistakes'));
const Revision = lazy(() => import('./modules/revision/Revision'));
const History = lazy(() => import('./modules/history/History'));
const Practice = lazy(() => import('./modules/practice/Practice'));
const PracticePlayer = lazy(() => import('./modules/practice/PracticePlayer'));
const PracticeReview = lazy(() => import('./modules/practice/PracticeReview'));
const Planner = lazy(() => import('./modules/planner/Planner'));
const RankPredictor = lazy(() => import('./modules/predictor/RankPredictor'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/mistakes" element={<Mistakes />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/history" element={<History />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/:id" element={<PracticePlayer />} />
          <Route path="/practice/review/:id" element={<PracticeReview />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/predictor" element={<RankPredictor />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ReloadPrompt />
    </Suspense>
  );
}

export default App;
