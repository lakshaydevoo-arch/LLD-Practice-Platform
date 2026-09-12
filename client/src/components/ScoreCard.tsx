import React from 'react';
import { Award } from 'lucide-react';
import { EvaluationDimension } from '../types';

interface ScoreCardProps {
  overallScore: number;
  providerUsed: string;
  dimensions: EvaluationDimension[];
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  overallScore,
  providerUsed,
  dimensions,
}) => {
  const getScoreBadge = (score: number) => {
    if (score >= 8.0) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 6.0) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getBarColor = (score: number) => {
    if (score >= 8.0) return 'bg-emerald-600';
    if (score >= 6.0) return 'bg-amber-600';
    return 'bg-rose-600';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-6 shadow-sm">
      {/* Overall Score Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-4">
          <div
            className={`h-16 w-16 rounded-lg flex flex-col items-center justify-center border font-bold ${getScoreBadge(
              overallScore
            )}`}
          >
            <span className="text-2xl leading-none">{overallScore.toFixed(1)}</span>
            <span className="text-[10px] uppercase font-semibold text-[#64748B] mt-0.5">/ 10</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#2563EB]" />
              <h2 className="text-lg font-semibold text-[#0F172A] tracking-tight">Design Evaluation Verdict</h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Weighted assessment across 6 architectural design dimensions.
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#64748B]">
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                Provider: {providerUsed === 'MOCK' ? 'Heuristic Rule Engine' : providerUsed}
              </span>
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Status</div>
          <div className="text-xs font-semibold text-[#0F172A] mt-0.5">
            {overallScore >= 8.0
              ? 'Strong Senior Architecture'
              : overallScore >= 6.5
              ? 'Acceptable (Decoupling Recommended)'
              : 'Suboptimal (Critical Issues Detected)'}
          </div>
        </div>
      </div>

      {/* Dimensional Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-medium text-[#475569] uppercase tracking-wider text-[11px]">
            Dimensional Breakdown
          </h3>
          <span className="text-[#64748B]">Weighted scoring rubric</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#0F172A]">{dim.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#64748B] font-mono">
                    Weight: {(dim.weight * 100).toFixed(0)}%
                  </span>
                  <span
                    className={`text-xs font-semibold font-mono px-1.5 py-0.5 rounded ${
                      dim.score >= 8
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : dim.score >= 6
                        ? 'text-amber-700 bg-amber-50 border border-amber-200'
                        : 'text-rose-700 bg-rose-50 border border-rose-200'
                    }`}
                  >
                    {dim.score.toFixed(1)}/10
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getBarColor(
                    dim.score
                  )}`}
                  style={{ width: `${(dim.score / 10) * 100}%` }}
                />
              </div>

              <p className="text-xs text-[#475569] leading-relaxed">{dim.reasoning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
