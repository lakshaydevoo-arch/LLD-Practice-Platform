import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Problem, Attempt } from '../types';
import { ProblemCard } from '../components/ProblemCard';

export const Dashboard: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        const [probs, atts] = await Promise.all([
          api.getProblems(),
          api.getAttempts(),
        ]);
        setProblems(probs);
        setAttempts(atts);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProblems =
    difficultyFilter === 'ALL'
      ? problems
      : problems.filter((p) => p.difficulty === difficultyFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Problem Library
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Choose an object-oriented design problem to practice architectural modeling and receive explainable feedback.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-md border border-[#E2E8F0] self-start sm:self-auto">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                difficultyFilter === diff
                  ? 'bg-white text-[#0F172A] shadow-sm font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-56 rounded-lg bg-white border border-[#E2E8F0] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProblems.map((problem) => {
            const probAttempts = attempts.filter((a) => a.problemId === problem.id);
            const best = probAttempts
              .map((a) => a.evaluation?.overallScore || 0)
              .sort((a, b) => b - a)[0];

            return (
              <ProblemCard
                key={problem.id}
                problem={problem}
                attemptCount={probAttempts.length}
                bestScore={best || undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
