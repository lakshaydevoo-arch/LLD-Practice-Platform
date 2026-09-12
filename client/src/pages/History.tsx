import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Attempt, Problem } from '../types';
import {
  History as HistoryIcon,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [problems, setProblems] = useState<Record<string, Problem>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [atts, probs] = await Promise.all([
          api.getAttempts(),
          api.getProblems(),
        ]);
        setAttempts(atts);

        const probMap: Record<string, Problem> = {};
        for (const p of probs) {
          probMap[p.id] = p;
        }
        setProblems(probMap);
      } catch (err) {
        console.error('Failed to load attempt history:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRetry = async (problemId: string) => {
    try {
      const newAtt = await api.createAttempt(problemId);
      navigate(`/attempt/${newAtt.id}`);
    } catch (err) {
      console.error('Failed to retry attempt:', err);
      alert('Could not initialize retry attempt.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EVALUATED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Evaluated
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="h-3 w-3 text-slate-500" />
            Draft
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="h-3 w-3 text-rose-600" />
            Failed
          </span>
        );
      default:
        return <span className="text-xs text-[#64748B]">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Attempt History
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Review your previous architectural submissions, score improvements, and retry problems.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] text-xs font-medium self-start sm:self-auto transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-[#64748B]" />
          <span>Browse Problems</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-white border border-[#E2E8F0] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#CBD5E1] rounded-lg bg-white space-y-2.5">
          <HistoryIcon className="h-8 w-8 text-[#94A3B8] mx-auto" />
          <h3 className="text-sm font-semibold text-[#0F172A]">No attempts recorded yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Choose a problem from the library to start your first practice attempt.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs shadow-sm"
            >
              Browse Problems
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => {
            const prob = problems[att.problemId];
            const issueCount = att.evaluation?.feedbackItems.filter((f) => f.type === 'CRITICAL' || f.type === 'WARNING').length ?? 0;

            return (
              <div
                key={att.id}
                className="p-4 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-[#0F172A]">
                      {prob?.title || 'LLD Problem'}
                    </h3>
                    {getStatusBadge(att.status)}
                    {prob?.difficulty && (
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                        {prob.difficulty}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                    <span>
                      {new Date(att.createdAt).toLocaleDateString()} at{' '}
                      {new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {att.status === 'EVALUATED' && (
                      <>
                        <span>•</span>
                        <span>
                          Issues Flagged:{' '}
                          <strong className={issueCount > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                            {issueCount}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Entities:{' '}
                          <strong className="text-[#334155]">
                            {att.solution?.classes.length || 0} classes,{' '}
                            {att.solution?.interfaces.length || 0} interfaces
                          </strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score and CTAs */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  {att.evaluation ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-semibold text-[#64748B]">Score</div>
                        <div
                          className={`text-base font-bold font-mono ${
                            att.evaluation.overallScore >= 8
                              ? 'text-emerald-700'
                              : att.evaluation.overallScore >= 6
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {att.evaluation.overallScore.toFixed(1)}/10
                        </div>
                      </div>

                      <Link
                        to={`/attempt/${att.id}/feedback`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] font-medium text-xs transition-colors"
                      >
                        <span>View Feedback</span>
                        <ArrowRight className="h-3 w-3 text-[#64748B]" />
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/attempt/${att.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] font-medium text-xs transition-colors"
                    >
                      <span>Resume Attempt</span>
                      <ArrowRight className="h-3 w-3 text-[#64748B]" />
                    </Link>
                  )}

                  {prob && (
                    <button
                      type="button"
                      onClick={() => handleRetry(prob.id)}
                      className="p-1.5 rounded-md bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#CBD5E1] transition-colors"
                      title="Retry this problem (creates a new attempt snapshot)"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
