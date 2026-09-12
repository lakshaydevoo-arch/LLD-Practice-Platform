import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Problem, Attempt } from '../types';
import {
  Clock,
  ArrowLeft,
  Play,
  ListOrdered,
  Layers,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const ProblemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const prob = await api.getProblem(id);
        setProblem(prob);
        const atts = await api.getAttempts(prob.id);
        setAttempts(atts);
      } catch (err) {
        console.error('Failed to load problem details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleStartPractice = async () => {
    if (!problem) return;
    setStarting(true);
    try {
      const attempt = await api.createAttempt(problem.id);
      navigate(`/attempt/${attempt.id}`);
    } catch (err) {
      console.error('Failed to start attempt:', err);
      alert('Could not initialize attempt. Please try again.');
    } finally {
      setStarting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-[#64748B]">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-6 bg-[#E2E8F0] rounded w-1/4" />
          <div className="h-24 bg-[#E2E8F0] rounded" />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-lg font-semibold text-[#0F172A]">Problem Not Found</h2>
        <p className="text-xs text-[#64748B]">The requested problem could not be found.</p>
        <Link to="/" className="inline-flex items-center gap-1.5 text-[#2563EB] text-xs font-medium">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Problems</span>
        </Link>
      </div>

      {/* Main Grid: Content (Left) + Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Statement & Specifications */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header section */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getDifficultyBadge(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className="text-xs text-[#64748B] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#94A3B8]" />
                {problem.timeEstimate}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {problem.title}
            </h1>

            <p className="text-sm text-[#475569] leading-relaxed">
              {problem.shortDescription}
            </p>
          </div>

          {/* Business Requirements */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-[#475569]" />
              Business & Domain Requirements
            </h2>
            <ul className="space-y-2 text-xs text-[#334155] leading-relaxed">
              {problem.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#2563EB] font-bold text-xs leading-5">•</span>
                  <span className="flex-1">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Functional Behaviors */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#475569]" />
              Expected Functional Behaviors
            </h2>
            <div className="space-y-1.5">
              {problem.functionalRequirements.map((func, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0F172A]"
                >
                  {func}
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#475569]" />
              Architectural Constraints & Guidelines
            </h2>
            <ul className="space-y-2 text-xs text-[#334155] leading-relaxed">
              {problem.constraints.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold text-xs leading-5">⚠</span>
                  <span className="flex-1">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Sidebar Actions & Hints */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {/* Action Box */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#0F172A]">Ready to design?</div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Model entities, contracts, relationships, and trade-offs in the practice workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartPractice}
              disabled={starting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{starting ? 'Initializing Workspace...' : 'Start Practice Workspace'}</span>
            </button>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Relevant Patterns
              </div>
              <div className="flex flex-wrap gap-1.5">
                {problem.concepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded border border-[#E2E8F0]"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#475569]" />
                <span>Entities to Consider</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {problem.expectedEntities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[11px] bg-[#F8FAFC] text-[#0F172A] px-2 py-0.5 rounded border border-[#E2E8F0]"
                  >
                    {ent}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Past Attempts on This Problem */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
              Previous Attempts ({attempts.length})
            </h3>
            {attempts.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No previous attempts for this problem.</p>
            ) : (
              <div className="space-y-2">
                {attempts.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-[#0F172A]">
                        {new Date(att.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        Status: <span className="font-medium text-[#0F172A]">{att.status}</span>
                      </div>
                    </div>
                    {att.evaluation ? (
                      <Link
                        to={`/attempt/${att.id}/feedback`}
                        className="font-mono font-semibold text-xs text-[#2563EB] hover:underline"
                      >
                        {att.evaluation.overallScore.toFixed(1)}/10 →
                      </Link>
                    ) : (
                      <Link
                        to={`/attempt/${att.id}`}
                        className="text-xs text-[#2563EB] hover:underline"
                      >
                        Resume →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
