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
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
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
      width: open ? '220px' : '0',
      overflow: 'hidden',
      background: theme.colors.primary,
      borderRight: open ? `2px solid ${theme.colors.primaryDark}` : 'none',
      transition: 'width 0.25s ease',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ width: '220px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          padding: '16px 14px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{
            fontFamily: theme.fonts.serif,
            fontSize: '11px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '10px',
          }}>
            Session Files
          </div>

          {/* + New Session — solid navy-on-off-white button */}
          <button
            onClick={onNewSession}
            style={{
              width: '100%',
              background: theme.colors.surface,
              color: theme.colors.primary,
              border: 'none',
              borderRadius: theme.radii.sm,
              padding: '9px',
              fontFamily: theme.fonts.serif,
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            ► New Session
          </button>
        </div>

        {/* Session list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sessions.length === 0 && (
            <div style={{
              padding: '18px 14px',
              fontFamily: theme.fonts.mono,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.3)',
              fontStyle: 'italic',
            }}>
              No session files on record.
            </div>
          )}
          {sessions.map(session => {
            const isCurrent = session.session_id === currentSessionId;
            return (
              <button
                key={session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: isCurrent ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${isCurrent ? theme.colors.surface : 'transparent'}`,
                  padding: '9px 12px 9px 11px',
                  cursor: 'pointer',
                  color: isCurrent ? theme.colors.surface : 'rgba(255,255,255,0.7)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <div style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: '12px',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px',
                }}>
                  {session.title}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: theme.fonts.serif,
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.38)',
                  letterSpacing: '0.05em',
                }}>
                  <span>{session.user_name}</span>
                  <span>{formatDate(session.last_active)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
