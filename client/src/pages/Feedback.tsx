import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Attempt, Problem, Evaluation } from '../types';
import { ScoreCard } from '../components/ScoreCard';
import { FeedbackSection } from '../components/FeedbackSection';
import {
  ArrowLeft,
  RotateCcw,
  BookOpen,
  FileCode,
  AlertOctagon,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const Feedback: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [showSolutionReview, setShowSolutionReview] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const att = await api.getAttempt(id);
        setAttempt(att);
        const prob = await api.getProblem(att.problemId);
        setProblem(prob);

        if (att.evaluation) {
          setEvaluation(att.evaluation);
        } else {
          try {
            const ev = await api.getEvaluation(id);
            setEvaluation(ev);
          } catch {
            // Ignore
          }
        }
      } catch (err) {
        console.error('Failed to load feedback view:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleRetryEvaluation = async () => {
    if (!id) return;
    setRetrying(true);
    try {
      const ev = await api.retryEvaluation(id);
      setEvaluation(ev);
      const updated = await api.getAttempt(id);
      setAttempt(updated);
    } catch (err) {
      console.error('Failed to retry evaluation:', err);
      alert('Retry failed. Please check your submission or try again.');
    } finally {
      setRetrying(false);
    }
  };

  const handleNewAttempt = async () => {
    if (!problem) return;
    try {
      const newAtt = await api.createAttempt(problem.id);
      navigate(`/attempt/${newAtt.id}`);
    } catch (err) {
      console.error('Failed to start new attempt:', err);
      alert('Could not start new attempt.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-[#64748B] space-y-3">
        <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm animate-spin">
          <RefreshCw className="h-5 w-5 text-[#2563EB]" />
        </div>
        <p className="text-xs font-medium text-[#475569]">Loading evaluation review...</p>
      </div>
    );
  }

  if (!attempt || !problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-lg font-semibold text-[#0F172A]">Evaluation Not Found</h2>
        <Link to="/" className="inline-flex items-center gap-1.5 text-[#2563EB] text-xs font-medium">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Link to="/" className="hover:text-[#0F172A]">Problems</Link>
            <span>/</span>
            <Link to={`/problems/${problem.slug || problem.id}`} className="hover:text-[#0F172A]">
              {problem.title}
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] font-medium">Feedback</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Design Critique & Review
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleNewAttempt}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs shadow-sm transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Try Again (New Attempt)</span>
          </button>

          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] font-medium text-xs transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#64748B]" />
            <span>View All Attempts</span>
          </Link>
        </div>
      </div>

      {/* State: FAILED */}
      {attempt.status === 'FAILED' && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 space-y-2 text-left">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="text-xs font-bold text-rose-900">Evaluation Could Not Be Completed</h3>
              <p className="text-xs text-rose-700">
                Your submitted solution was preserved safely. You can retry evaluation now.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleRetryEvaluation}
              disabled={retrying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Retrying...' : 'Retry Evaluation'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Feedback Content */}
      {evaluation && (
        <div className="space-y-6">
          <ScoreCard
            overallScore={evaluation.overallScore}
            providerUsed={evaluation.providerUsed}
            dimensions={evaluation.dimensions}
          />

          <FeedbackSection feedbackItems={evaluation.feedbackItems} />
        </div>
      )}

      {/* Collapsible Section: Inspect Submitted Design */}
      {attempt.solution && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSolutionReview(!showSolutionReview)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-[#475569]" />
              <span>Inspect Submitted Architecture</span>
            </span>
            {showSolutionReview ? <ChevronUp className="h-4 w-4 text-[#64748B]" /> : <ChevronDown className="h-4 w-4 text-[#64748B]" />}
          </button>

          {showSolutionReview && (
            <div className="p-4 border-t border-[#E2E8F0] space-y-4 text-xs bg-[#F8FAFC]">
              {/* Classes */}
              <div>
                <div className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] mb-1.5">
                  Classes Defined ({attempt.solution.classes.length}):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {attempt.solution.classes.map((cls, idx) => (
                    <div key={idx} className="p-3 rounded-md bg-white border border-[#E2E8F0] space-y-1">
                      <div className="font-mono font-semibold text-[#0F172A]">{cls.name}</div>
                      <div className="text-[#475569]">{cls.responsibility}</div>
                      {cls.attributes.length > 0 && (
                        <div className="font-mono text-[11px] text-[#64748B] pt-0.5">
                          Attrs: {cls.attributes.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interfaces */}
              {attempt.solution.interfaces.length > 0 && (
                <div>
                  <div className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] mb-1.5">
                    Interfaces Defined ({attempt.solution.interfaces.length}):
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {attempt.solution.interfaces.map((iface, idx) => (
                      <div key={idx} className="p-3 rounded-md bg-white border border-[#E2E8F0] space-y-1">
                        <div className="font-mono font-semibold text-[#2563EB]">{iface.name}</div>
                        <div className="text-[#475569]">{iface.responsibility}</div>
                        {iface.methods.length > 0 && (
                          <div className="font-mono text-[11px] text-[#64748B] pt-0.5">
                            Methods: {iface.methods.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationships */}
              {attempt.solution.relationships.length > 0 && (
                <div>
                  <div className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] mb-1.5">
                    Relationships ({attempt.solution.relationships.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {attempt.solution.relationships.map((rel, idx) => (
                      <div key={idx} className="px-2.5 py-1 rounded bg-white border border-[#E2E8F0] font-mono text-[11px] text-[#0F172A]">
                        <span className="font-medium">{rel.fromEntity}</span>
                        <span className="text-[#64748B] mx-1.5">--[{rel.type}]--&gt;</span>
                        <span className="font-medium">{rel.toEntity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Explanation */}
              {attempt.solution.explanation && (
                <div>
                  <div className="font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] mb-1">
                    Design Rationale:
                  </div>
                  <p className="text-[#475569] bg-white p-3 rounded-md border border-[#E2E8F0] leading-relaxed">
                    {attempt.solution.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
