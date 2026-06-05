import { theme } from '../styles/theme';

interface HeaderProps {
  sessionTitle: string;
  userName: string;
  onToggleSessions: () => void;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function nowLabel() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export default function Header({ sessionTitle, userName, onToggleSessions }: HeaderProps) {
  return (
    <header style={{ background: theme.colors.surface, flexShrink: 0, zIndex: 10 }}>
      <div style={{
        padding: '24px 28px 16px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        {/* Left: wordmark + drawer toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
          <button
            onClick={onToggleSessions}
            title="Session history"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.colors.grey,
              fontSize: '18px',
              lineHeight: 1,
              padding: '0 0 4px 0',
              fontFamily: theme.fonts.mono,
            }}
          >
            ☰
          </button>

          <div>
            {/* Masthead wordmark */}
            <div style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '38px',
              letterSpacing: '-0.03em',
              color: theme.colors.primary,
              lineHeight: 1,
            }}>
              Dunder Mifflin
            </div>
            {/* Tagline */}
            <div style={{
              fontFamily: theme.fonts.serif,
              fontStyle: 'italic',
              fontSize: '13px',
              color: theme.colors.grey,
              marginTop: '3px',
            }}>
              Limitless Paper in a Paperless World
            </div>
            {/* Location label */}
            <div style={{
              fontFamily: theme.fonts.serif,
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: theme.colors.grey,
              marginTop: '4px',
            }}>
              Scranton Branch · Internal Portal
            </div>
          </div>
        </div>

        {/* Right: session info + stamp */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
        }}>
          <div style={{
            fontFamily: theme.fonts.serif,
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: theme.colors.grey,
          }}>
            Session: {userName} · {nowLabel()}
          </div>
          <div style={{
            fontFamily: theme.fonts.serif,
            fontSize: '11px',
            color: theme.colors.grey,
            fontStyle: 'italic',
            maxWidth: '220px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {sessionTitle}
          </div>
        </div>
      </div>

      {/* 2px navy rule separating header from content */}
      <div style={{ height: '2px', background: theme.colors.primary }} />
    </header>
  );
}
