import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ProblemDetails } from './pages/ProblemDetails';
import { Practice } from './pages/Practice';
import { Feedback } from './pages/Feedback';
import { History } from './pages/History';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
        <Navbar />

        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/problems" element={<Navigate to="/" replace />} />
            <Route path="/problems/:id" element={<ProblemDetails />} />
            <Route path="/attempt/:id" element={<Practice />} />
            <Route path="/attempt/:id/feedback" element={<Feedback />} />
            <Route path="/attempt/:id/review" element={<Feedback />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium text-[#475569]">
              <span className="font-semibold text-[#0F172A]">LLD Practice</span>
              <span>—</span>
              <span>Object-Oriented System Modeling & Evaluation</span>
            </div>
            <div className="text-[#64748B] text-xs">
              Hybrid Evaluation Architecture • Deterministic Rules + Domain Reasoning
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
