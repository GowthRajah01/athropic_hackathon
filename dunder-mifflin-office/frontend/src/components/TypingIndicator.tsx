import { getAgentStyle } from '../styles/agents';
import { theme } from '../styles/theme';

interface TypingIndicatorProps {
  activeAgents: string[];
  phase: 'routing' | 'specialists' | 'synthesis' | null;
}

export default function TypingIndicator({ activeAgents, phase }: TypingIndicatorProps) {
  if (!phase) return null;

  let target = 'Scranton Branch';
  if (phase === 'routing') {
    target = 'Michael Scott · Management';
  } else if (phase === 'specialists') {
    const names = activeAgents
      .filter(a => a !== 'michael-scott')
      .map(a => getAgentStyle(a).label.split(' ')[0]);
    target = names.length > 0 ? names.join(', ') + ' · Staff' : 'Team · Staff';
  } else if (phase === 'synthesis') {
    target = 'Michael Scott · Management';
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      border: `1px dashed ${theme.colors.primary}`,
      borderRadius: theme.radii.sm,
      marginBottom: '18px',
      animation: 'faxPulse 1.6s ease-in-out infinite',
    }}>
      {/* Red status dot */}
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: theme.colors.red,
        flexShrink: 0,
      }} />

      {/* Transmission label */}
      <span style={{
        fontFamily: theme.fonts.mono,
        fontSize: '13px',
        color: theme.colors.primary,
      }}>
        Transmitting to {target}…
      </span>

      {/* Blinking cursor */}
      <span style={{
        fontFamily: theme.fonts.mono,
        fontSize: '14px',
        color: theme.colors.primary,
        animation: 'cursorBlink 1s steps(1) infinite',
      }}>
        ▌
      </span>
    </div>
  );
}
