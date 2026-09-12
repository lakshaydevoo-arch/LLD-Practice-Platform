import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, History, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-md bg-[#0F172A] flex items-center justify-center text-white">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-[#0F172A]">LLD Practice</span>
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                Platform
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive('/') && !isActive('/history')
                  ? 'bg-[#F1F5F9] text-[#0F172A]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-[#64748B]" />
              Problems
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive('/history')
                  ? 'bg-[#F1F5F9] text-[#0F172A]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <History className="h-3.5 w-3.5 text-[#64748B]" />
              History
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pl-3 border-l border-[#E2E8F0]">
            <div className="h-6 w-6 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[11px] font-medium text-[#475569]">
              AR
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-[#0F172A] leading-none">Alex Rivera</div>
              <div className="text-[10px] text-[#64748B] leading-none mt-1">Staff Engineer Trainee</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
