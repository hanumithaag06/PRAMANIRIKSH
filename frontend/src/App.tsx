import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { TestCapturePage } from './pages/TestCapturePage';
import { TestDetailPage } from './pages/TestDetailPage';
import { VerificationPage } from './pages/VerificationPage';
import { HistoryPage } from './pages/HistoryPage';
import { KitProfilesPage } from './pages/KitProfilesPage';
import { KnowledgePage } from './pages/KnowledgePage';

export function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/capture" element={<TestCapturePage />} />
            <Route path="/tests/:test_id" element={<TestDetailPage />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/kits" element={<KitProfilesPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
