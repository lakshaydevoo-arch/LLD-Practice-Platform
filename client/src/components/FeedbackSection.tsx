import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Lightbulb,
  Code2,
} from 'lucide-react';
import { FeedbackItem, FeedbackType } from '../types';

interface FeedbackSectionProps {
  feedbackItems: FeedbackItem[];
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({ feedbackItems }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | FeedbackType>('ALL');

  const strengths = feedbackItems.filter((f) => f.type === 'STRENGTH');
  const criticals = feedbackItems.filter((f) => f.type === 'CRITICAL');
  const warnings = feedbackItems.filter((f) => f.type === 'WARNING');

  const filteredItems =
    activeFilter === 'ALL'
      ? feedbackItems
      : feedbackItems.filter((f) => f.type === activeFilter);

  const getTypeBadge = (type: FeedbackType) => {
    switch (type) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="h-3 w-3" />
            Critical Flaw
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3 w-3" />
            Design Warning
          </span>
        );
      case 'STRENGTH':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Strength
          </span>
        );
      case 'SUGGESTION':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            <Lightbulb className="h-3 w-3" />
            Suggestion
          </span>
        );
    }
  };

  const getBorderLeft = (type: FeedbackType) => {
    switch (type) {
      case 'CRITICAL':
        return 'border-l-4 border-l-rose-500 border-rose-200';
      case 'WARNING':
        return 'border-l-4 border-l-amber-500 border-amber-200';
      case 'STRENGTH':
        return 'border-l-4 border-l-emerald-500 border-emerald-200';
      default:
        return 'border-l-4 border-l-sky-500 border-sky-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Category filter pills */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A]">
            Architectural Review & Actionable Critique ({feedbackItems.length})
          </h3>
          <p className="text-xs text-[#64748B]">
            Specific architectural findings categorized by severity and component impact.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-[#0F172A] text-white'
                : 'text-[#475569] hover:bg-[#F1F5F9] bg-white border border-[#CBD5E1]'
            }`}
          >
            All ({feedbackItems.length})
          </button>
          {criticals.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeFilter === 'CRITICAL'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-rose-700 hover:bg-rose-50 bg-white border border-rose-200'
              }`}
            >
              Critical ({criticals.length})
            </button>
          )}
          {warnings.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('WARNING')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeFilter === 'WARNING'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-amber-700 hover:bg-amber-50 bg-white border border-amber-200'
              }`}
            >
              Warnings ({warnings.length})
            </button>
          )}
          {strengths.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('STRENGTH')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeFilter === 'STRENGTH'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-emerald-700 hover:bg-emerald-50 bg-white border border-emerald-200'
              }`}
            >
              Strengths ({strengths.length})
            </button>
          )}
        </div>
      </div>

      {/* Feed list */}
      <div className="space-y-3">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border bg-white shadow-sm space-y-3 ${getBorderLeft(item.type)}`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {getTypeBadge(item.type)}
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="space-y-2.5">
              <h4 className="text-sm font-semibold text-[#0F172A] leading-snug">
                {item.problem}
              </h4>

              {/* Why It Matters */}
              {item.whyItMatters && item.type !== 'STRENGTH' && (
                <div className="bg-[#F8FAFC] p-3 rounded-md border border-[#E2E8F0]">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#475569] mb-1">
                    Why This Matters (Architectural Impact):
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">{item.whyItMatters}</p>
                </div>
              )}

              {/* Suggested Improvement */}
              {item.suggestion && item.type !== 'STRENGTH' && (
                <div className="bg-emerald-50/50 p-3 rounded-md border border-emerald-200/80">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800 mb-1">
                    Suggested Improvement:
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">{item.suggestion}</p>
                </div>
              )}

              {/* Code Alternative */}
              {item.example && (
                <div className="mt-2.5">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#475569] flex items-center gap-1.5 mb-1">
                    <Code2 className="h-3.5 w-3.5 text-[#2563EB]" />
                    Refactored Interface / Code Alternative:
                  </div>
                  <pre className="p-3 rounded-md bg-[#0F172A] border border-[#1E293B] text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                    <code>{item.example}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
