import { Problem, Attempt, SolutionData, Evaluation } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const json = await res.json();
      errorMsg = json.error?.message || json.message || errorMsg;
    } catch {
      // Ignore JSON parse error and use default
    }
    throw new Error(errorMsg);
  }
  const json = await res.json();
  return json.data as T;
}

export const api = {
  async getProblems(): Promise<Problem[]> {
    const res = await fetch(`${API_BASE}/problems`);
    return handleResponse<Problem[]>(res);
  },

  async getProblem(idOrSlug: string): Promise<Problem> {
    const res = await fetch(`${API_BASE}/problems/${idOrSlug}`);
    return handleResponse<Problem>(res);
  },

  async createAttempt(problemId: string, userId: string = 'demo-learner-001'): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, userId }),
    });
    return handleResponse<Attempt>(res);
  },

  async getAttempt(id: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${id}`);
    return handleResponse<Attempt>(res);
  },

  async getAttempts(problemId?: string): Promise<Attempt[]> {
    const url = problemId ? `${API_BASE}/attempts?problemId=${problemId}` : `${API_BASE}/attempts`;
    const res = await fetch(url);
    return handleResponse<Attempt[]>(res);
  },

  async saveDraft(attemptId: string, solution: SolutionData): Promise<SolutionData> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solution),
    });
    return handleResponse<SolutionData>(res);
  },

  async submitAttempt(attemptId: string, solution: SolutionData): Promise<{ attemptId: string; status: string; evaluation: Evaluation }> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solution),
    });
    return handleResponse<{ attemptId: string; status: string; evaluation: Evaluation }>(res);
  },

  async getEvaluation(attemptId: string): Promise<Evaluation> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/evaluation`);
    return handleResponse<Evaluation>(res);
  },

  async retryEvaluation(attemptId: string): Promise<Evaluation> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/retry-evaluation`, {
      method: 'POST',
    });
    return handleResponse<Evaluation>(res);
  },
};
