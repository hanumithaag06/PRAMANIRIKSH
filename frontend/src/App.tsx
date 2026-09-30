import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { AppShell } from './components/AppShell';

// Pages
import { LoginPage }        from './pages/LoginPage';
import { HomePage }         from './pages/HomePage';
import { PreparePage }      from './pages/PreparePage';
import { TestCapturePage }  from './pages/TestCapturePage';
import { AnalysisPage }     from './pages/AnalysisPage';
import { ResultPage }       from './pages/ResultPage';
import { EvidencePage }     from './pages/EvidencePage';
import { TestDetailPage }   from './pages/TestDetailPage';
import { VerificationPage } from './pages/VerificationPage';
import { HistoryPage }      from './pages/HistoryPage';
import { KitProfilesPage }  from './pages/KitProfilesPage';
import { KnowledgePage }    from './pages/KnowledgePage';

/** Route guard — redirects unauthenticated users to /login */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-mono">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/** Route guard — redirects authenticated users away from /login */
const RedirectIfAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>}
      />

      {/* Authenticated — wrapped in AppShell */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/"                   element={<HomePage />} />
        <Route path="/test/prepare"       element={<PreparePage />} />
        <Route path="/test/capture"       element={<TestCapturePage />} />
        <Route path="/test/analyse"       element={<AnalysisPage />} />
        <Route path="/test/result/:id"    element={<ResultPage />} />
        <Route path="/test/evidence/:id"  element={<EvidencePage />} />
        <Route path="/tests/:test_id"     element={<TestDetailPage />} />
        <Route path="/history"            element={<HistoryPage />} />
        <Route path="/verify"             element={<VerificationPage />} />
        <Route path="/kits"               element={<KitProfilesPage />} />
        <Route path="/knowledge"          element={<KnowledgePage />} />
        {/* Fallback inside auth */}
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Route>

      {/* Root fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <Router>
          <AppRoutes />
        </Router>
      </I18nProvider>
    </AuthProvider>
  );
}

export default App;
