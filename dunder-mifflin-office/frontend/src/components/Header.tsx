import { theme } from '../styles/theme';

interface HeaderProps {
  sessionTitle: string;
  userName: string;
  onToggleSessions: () => void;
}

export default function Header({ sessionTitle, userName, onToggleSessions }: HeaderProps) {
  return (
    <header style={{
      background: theme.colors.primary,
      color: theme.colors.white,
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      flexShrink: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSessions}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px 8px',
            borderRadius: theme.radii.sm,
            lineHeight: 1,
          }}
          title="Session history"
        >
          ☰
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Dunder Mifflin logo mark */}
          <div style={{
            width: '40px',
            height: '40px',
            background: theme.colors.gold,
            borderRadius: theme.radii.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: theme.fonts.heading,
            fontWeight: 'bold',
            fontSize: '16px',
            color: theme.colors.primary,
            letterSpacing: '-1px',
            flexShrink: 0,
          }}>
            DM
          </div>
          <div>
            <div style={{
              fontFamily: theme.fonts.heading,
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              lineHeight: 1.1,
            }}>
              Dunder Mifflin
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.6)',
              fontStyle: 'italic',
              letterSpacing: '0.3px',
            }}>
              Limitless Paper in a Paperless World
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.7)',
          fontStyle: 'italic',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {sessionTitle}
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: theme.radii.pill,
          padding: '4px 12px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.9)',
        }}>
          👤 {userName}
        </div>
      </div>
    </header>
  );
}
