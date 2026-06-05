import { getAgentStyle } from '../styles/agents';
import { theme } from '../styles/theme';

interface TypingIndicatorProps {
  activeAgents: string[];
  phase: 'routing' | 'specialists' | 'synthesis' | null;
}

export default function TypingIndicator({ activeAgents, phase }: TypingIndicatorProps) {
  if (!phase) return null;

  let label = '';
  if (phase === 'routing') label = 'Michael is delegating…';
  else if (phase === 'specialists') {
    const names = activeAgents
      .filter(a => a !== 'michael-scott')
      .map(a => getAgentStyle(a).label.split(' ')[0]);
    label = names.length > 0 ? `${names.join(', ')} ${names.length > 1 ? 'are' : 'is'} working…` : 'Working…';
  } else if (phase === 'synthesis') {
    label = 'Michael is putting it all together…';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0 12px 4px' }}>
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: theme.colors.primary,
            animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <span style={{
        fontSize: '12px',
        color: theme.colors.textMuted,
        fontStyle: 'italic',
      }}>
        {label}
      </span>
    </div>
  );
}
