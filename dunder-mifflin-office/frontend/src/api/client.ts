import type { AgentInfo, ChatResponse, SessionHistoryResponse, SessionSummary, StreamEvent } from '../types';

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

export async function* sendMessageStream(
  message: string,
  sessionId: string,
  userName: string,
): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId, user_name: userName }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = line.slice(6).trim();
        if (json) yield JSON.parse(json) as StreamEvent;
      }
    }
  }
}
