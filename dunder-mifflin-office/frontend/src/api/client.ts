import type { AgentInfo, ChatResponse, SessionHistoryResponse, SessionSummary } from '../types';

const BASE_URL = 'http://localhost:8000/api';

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getAgents(): Promise<AgentInfo[]> {
  return fetchJSON('/agents');
}

export async function getSessions(): Promise<SessionSummary[]> {
  return fetchJSON('/sessions');
}

export async function createSession(userName: string, title?: string): Promise<SessionSummary> {
  return fetchJSON('/sessions', {
    method: 'POST',
    body: JSON.stringify({ user_name: userName, title: title ?? '' }),
  });
}

export async function getSessionHistory(sessionId: string): Promise<SessionHistoryResponse> {
  return fetchJSON(`/sessions/${sessionId}`);
}

export async function sendMessage(
  message: string,
  sessionId: string,
  userName: string,
): Promise<ChatResponse> {
  return fetchJSON('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId, user_name: userName }),
  });
}
