import type { SessionSummary } from '../types';
import { theme } from '../styles/theme';

interface SessionDrawerProps {
  open: boolean;
  sessions: SessionSummary[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function SessionDrawer({
  open,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
}: SessionDrawerProps) {
  return (
    <div style={{
      width: open ? '240px' : '0',
      overflow: 'hidden',
      background: theme.colors.primaryDark,
      transition: 'width 0.25s ease',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ width: '240px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '16px 14px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <button
            onClick={onNewSession}
            style={{
              width: '100%',
              background: theme.colors.gold,
              color: theme.colors.primary,
              border: 'none',
              borderRadius: theme.radii.md,
              padding: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            + New Session
          </button>
        </div>

        <div style={{
          padding: '12px 8px',
          fontSize: '10px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          paddingBottom: '4px',
        }}>
          Sessions
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sessions.length === 0 && (
            <div style={{
              padding: '16px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.3)',
              fontStyle: 'italic',
              textAlign: 'center',
            }}>
              No sessions yet
            </div>
          )}
          {sessions.map(session => (
            <button
              key={session.session_id}
              onClick={() => onSelectSession(session.session_id)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: session.session_id === currentSessionId
                  ? 'rgba(255,255,255,0.12)'
                  : 'transparent',
                border: 'none',
                borderLeft: session.session_id === currentSessionId
                  ? `3px solid ${theme.colors.gold}`
                  : '3px solid transparent',
                padding: '10px 12px',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.85)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => {
                if (session.session_id !== currentSessionId) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                }
              }}
              onMouseLeave={e => {
                if (session.session_id !== currentSessionId) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '2px',
              }}>
                {session.title}
              </div>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>{session.user_name}</span>
                <span>{formatDate(session.last_active)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
