import { useState, useEffect, useCallback, useReducer } from 'react';
import type { AgentInfo, AgentMessage, SessionHistoryResponse, SessionSummary } from './types';
import * as api from './api/client';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import InputBar from './components/InputBar';
import AgentSidebar from './components/AgentSidebar';
import SessionDrawer from './components/SessionDrawer';
import { theme } from './styles/theme';
import './App.css';

interface DisplayMessage {
  id: string;
  timestamp: string;
  type: 'user' | 'agent';
  content: string;
  userName?: string;
  agentMessage?: AgentMessage;
}

type LoadingPhase = 'routing' | 'specialists' | 'synthesis' | null;

interface AppState {
  agents: AgentInfo[];
  sessions: SessionSummary[];
  currentSessionId: string | null;
  currentSession: SessionHistoryResponse | null;
  pendingMessages: DisplayMessage[];
  activeAgents: string[];
  loadingPhase: LoadingPhase;
  drawerOpen: boolean;
  userName: string;
  error: string | null;
}

type Action =
  | { type: 'SET_AGENTS'; agents: AgentInfo[] }
  | { type: 'SET_SESSIONS'; sessions: SessionSummary[] }
  | { type: 'SET_SESSION'; session: SessionHistoryResponse; sessionId: string }
  | { type: 'SET_PHASE'; phase: LoadingPhase }
  | { type: 'SET_ACTIVE_AGENTS'; agents: string[] }
  | { type: 'ADD_PENDING'; message: DisplayMessage }
  | { type: 'APPEND_CHUNK'; id: string; chunk: string }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'UPSERT_SESSION'; session: SessionSummary };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AGENTS': return { ...state, agents: action.agents };
    case 'SET_SESSIONS': return { ...state, sessions: action.sessions };
    case 'SET_SESSION': return {
      ...state,
      currentSession: action.session,
      currentSessionId: action.sessionId,
      pendingMessages: [],
    };
    case 'SET_PHASE': return { ...state, loadingPhase: action.phase };
    case 'SET_ACTIVE_AGENTS': return { ...state, activeAgents: action.agents };
    case 'ADD_PENDING': return { ...state, pendingMessages: [...state.pendingMessages, action.message] };
    case 'APPEND_CHUNK': return {
      ...state,
      pendingMessages: state.pendingMessages.map(m =>
        m.id === action.id
          ? { ...m, content: m.content + action.chunk, agentMessage: m.agentMessage ? { ...m.agentMessage, content: m.agentMessage.content + action.chunk } : undefined }
          : m
      ),
    };
    case 'TOGGLE_DRAWER': return { ...state, drawerOpen: !state.drawerOpen };
    case 'SET_ERROR': return { ...state, error: action.error, loadingPhase: null, activeAgents: [] };
    case 'UPSERT_SESSION': {
      const exists = state.sessions.some(s => s.session_id === action.session.session_id);
      const sessions = exists
        ? state.sessions.map(s => s.session_id === action.session.session_id ? action.session : s)
        : [action.session, ...state.sessions];
      return { ...state, sessions };
    }
    default: return state;
  }
}

const INITIAL_USER_NAME = 'Regional Director';

export default function App() {
  const [state, dispatch] = useReducer(reducer, {
    agents: [],
    sessions: [],
    currentSessionId: null,
    currentSession: null,
    pendingMessages: [],
    activeAgents: [],
    loadingPhase: null,
    drawerOpen: false,
    userName: INITIAL_USER_NAME,
    error: null,
  });

  const [dismissedError, setDismissedError] = useState(false);

  useEffect(() => {
    Promise.all([api.getAgents(), api.getSessions()]).then(([agents, sessions]) => {
      dispatch({ type: 'SET_AGENTS', agents });
      dispatch({ type: 'SET_SESSIONS', sessions });
    }).catch(err => {
      dispatch({ type: 'SET_ERROR', error: `Failed to connect to backend: ${(err as Error).message}` });
    });
  }, []);

  const handleNewSession = useCallback(async () => {
    try {
      const session = await api.createSession(state.userName);
      dispatch({ type: 'UPSERT_SESSION', session });
      const history = await api.getSessionHistory(session.session_id);
      dispatch({ type: 'SET_SESSION', session: history, sessionId: session.session_id });
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', error: String(err) });
    }
  }, [state.userName]);

  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      const history = await api.getSessionHistory(sessionId);
      dispatch({ type: 'SET_SESSION', session: history, sessionId });
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', error: String(err) });
    }
  }, []);

  useEffect(() => {
    if (state.agents.length > 0 && state.currentSessionId === null) {
      handleNewSession();
    }
  }, [state.agents.length, state.currentSessionId, handleNewSession]);

  const handleSend = useCallback(async (message: string) => {
    if (!state.currentSessionId || state.loadingPhase) return;

    const sessionId = state.currentSessionId;

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'user',
      content: message,
      userName: state.userName,
    };
    dispatch({ type: 'ADD_PENDING', message: userMsg });
    dispatch({ type: 'SET_PHASE', phase: 'routing' });
    dispatch({ type: 'SET_ACTIVE_AGENTS', agents: ['michael-scott'] });

    try {
      for await (const event of api.sendMessageStream(message, sessionId, state.userName)) {
        if (event.type === 'message_start') {
          const shell: DisplayMessage = {
            id: event.id,
            timestamp: event.timestamp,
            type: 'agent',
            content: '',
            agentMessage: {
              id: event.id,
              timestamp: event.timestamp,
              agent: event.agent,
              agent_display_name: event.agent_display_name,
              agent_emoji: event.agent_emoji,
              agent_color: event.agent_color,
              content: '',
              message_type: event.message_type,
            },
          };
          dispatch({ type: 'ADD_PENDING', message: shell });

          if (event.message_type === 'specialist') {
            dispatch({ type: 'SET_PHASE', phase: 'specialists' });
          } else if (event.message_type === 'synthesis') {
            dispatch({ type: 'SET_PHASE', phase: 'synthesis' });
            dispatch({ type: 'SET_ACTIVE_AGENTS', agents: ['michael-scott'] });
          }
        } else if (event.type === 'content_chunk') {
          dispatch({ type: 'APPEND_CHUNK', id: event.id, chunk: event.chunk });
        } else if (event.type === 'message_end') {
          if (event.routing) {
            dispatch({ type: 'SET_ACTIVE_AGENTS', agents: event.routing.agents });
          }
        } else if (event.type === 'done') {
          dispatch({ type: 'SET_PHASE', phase: null });
          dispatch({ type: 'SET_ACTIVE_AGENTS', agents: [] });

          const [freshHistory, sessions] = await Promise.all([
            api.getSessionHistory(sessionId),
            api.getSessions(),
          ]);
          dispatch({ type: 'SET_SESSION', session: freshHistory, sessionId });
          dispatch({ type: 'SET_SESSIONS', sessions });
        }
      }
    } catch (err: unknown) {
      dispatch({ type: 'SET_ERROR', error: `The fax machine has encountered a difficulty: ${String(err)}` });
    }
  }, [state.currentSessionId, state.loadingPhase, state.userName]);

  const currentTitle = state.currentSession?.title ?? 'Dunder Mifflin — Scranton';

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: theme.colors.background,
      fontFamily: theme.fonts.mono,
    }}>
      <Header
        sessionTitle={currentTitle}
        userName={state.userName}
        onToggleSessions={() => dispatch({ type: 'TOGGLE_DRAWER' })}
      />

      {/* Error banner — in-character, red stamp feel */}
      {state.error && !dismissedError && (
        <div style={{
          background: 'rgba(192,57,43,0.07)',
          borderBottom: `1px solid ${theme.colors.red}`,
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontFamily: theme.fonts.mono,
            fontSize: '13px',
            color: theme.colors.red,
          }}>
            ◉ {state.error}
          </span>
          <button
            onClick={() => { dispatch({ type: 'SET_ERROR', error: null }); setDismissedError(true); }}
            style={{
              background: 'none',
              border: `1px solid ${theme.colors.red}`,
              borderRadius: theme.radii.sm,
              cursor: 'pointer',
              color: theme.colors.red,
              fontFamily: theme.fonts.mono,
              fontSize: '11px',
              padding: '2px 8px',
              letterSpacing: '0.12em',
            }}
          >
            DISMISS
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <SessionDrawer
          open={state.drawerOpen}
          sessions={state.sessions}
          currentSessionId={state.currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ChatPanel
            pendingMessages={state.pendingMessages}
            history={state.currentSession}
            activeAgents={state.activeAgents}
            loadingPhase={state.loadingPhase}
            userName={state.userName}
          />
          <InputBar
            onSend={handleSend}
            disabled={!!state.loadingPhase || !state.currentSessionId}
          />

          {/* Footer */}
          <footer style={{
            textAlign: 'center',
            padding: '8px 16px',
            borderTop: `1px solid ${theme.colors.borderGrey}`,
            fontFamily: theme.fonts.serif,
            fontStyle: 'italic',
            fontSize: '12px',
            color: theme.colors.grey,
            background: theme.colors.surface,
            flexShrink: 0,
          }}>
            Dunder Mifflin Inc. · Scranton, PA · Est. 1949 · Limitless Paper in a Paperless World
          </footer>
        </div>

        <AgentSidebar
          agents={state.agents}
          activeAgents={state.activeAgents}
        />
      </div>
    </div>
  );
}
