import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Problem } from '../types';

interface ProblemCardProps {
  problem: Problem;
  attemptCount?: number;
  bestScore?: number;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  attemptCount = 0,
  bestScore,
}) => {
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HARD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg p-5 flex flex-col justify-between transition-colors shadow-sm group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getDifficultyBadge(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <Clock className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span>{problem.timeEstimate}</span>
          </div>
        </div>

        <h3 className="text-base font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors tracking-tight">
          {problem.title}
        </h3>

        <p className="text-xs text-[#475569] mt-2 line-clamp-2 leading-relaxed">
          {problem.shortDescription}
        </p>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {problem.concepts.slice(0, 3).map((concept, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded border border-[#E2E8F0]"
            >
              {concept}
            </span>
          ))}
          {problem.concepts.length > 3 && (
            <span className="text-[11px] text-[#94A3B8] px-1 py-0.5">
              +{problem.concepts.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between">
        <div className="text-xs text-[#64748B]">
          {attemptCount > 0 ? (
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {attemptCount} {attemptCount === 1 ? 'attempt' : 'attempts'}
                {bestScore ? ` (Best: ${bestScore}/10)` : ''}
              </span>
            </div>
          ) : (
            <span className="text-[#94A3B8]">Not attempted</span>
          )}
        </div>

        <Link
          to={`/problems/${problem.slug || problem.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F8FAFC] text-[#0F172A] hover:text-[#2563EB] font-medium text-xs border border-[#CBD5E1] transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="h-3 w-3 text-[#64748B]" />
        </Link>
      </div>
    </div>
  );
};
