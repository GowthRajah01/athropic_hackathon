import ReactMarkdown from 'react-markdown';
import type { AgentMessage } from '../types';
import { theme } from '../styles/theme';
import { getAgentStyle } from '../styles/agents';

interface UserBubbleProps {
  content: string;
  userName: string;
  timestamp: string;
}

export function UserBubble({ content, userName, timestamp }: UserBubbleProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
      <div style={{ maxWidth: '65%' }}>
        <div style={{
          fontSize: '11px',
          color: theme.colors.textMuted,
          textAlign: 'right',
          marginBottom: '4px',
        }}>
          {userName} · {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{
          background: theme.colors.userBubble,
          color: theme.colors.userBubbleText,
          padding: '12px 16px',
          borderRadius: `${theme.radii.lg} ${theme.radii.lg} ${theme.radii.sm} ${theme.radii.lg}`,
          fontSize: '14px',
          lineHeight: 1.6,
          boxShadow: theme.shadows.sm,
          whiteSpace: 'pre-wrap',
        }}>
          {content}
        </div>
      </div>
    </div>
  );
}

interface AgentBubbleProps {
  message: AgentMessage;
}

const messageTypeConfig = {
  routing: {
    label: 'Delegating…',
    labelColor: theme.colors.textMuted,
    borderStyle: 'dashed',
    backgroundTint: 'rgba(0,0,0,0.02)',
    italic: true,
  },
  specialist: {
    label: null,
    labelColor: '',
    borderStyle: 'solid',
    backgroundTint: 'transparent',
    italic: false,
  },
  synthesis: {
    label: 'Summary',
    labelColor: theme.colors.gold,
    borderStyle: 'solid',
    backgroundTint: 'rgba(196,160,53,0.05)',
    italic: false,
  },
};

export function AgentBubble({ message }: AgentBubbleProps) {
  const agentStyle = getAgentStyle(message.agent);
  const typeConfig = messageTypeConfig[message.message_type] ?? messageTypeConfig.specialist;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
      <div style={{ maxWidth: '75%', minWidth: '200px' }}>
        {/* Agent header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px',
          paddingLeft: '4px',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: agentStyle.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            flexShrink: 0,
          }}>
            {agentStyle.emoji}
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: agentStyle.color,
          }}>
            {message.agent_display_name}
          </span>
          {typeConfig.label && (
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              color: typeConfig.labelColor,
              background: message.message_type === 'synthesis'
                ? 'rgba(196,160,53,0.15)'
                : 'rgba(0,0,0,0.06)',
              padding: '1px 6px',
              borderRadius: theme.radii.pill,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              {typeConfig.label}
            </span>
          )}
          <span style={{
            fontSize: '10px',
            color: theme.colors.textLight,
            marginLeft: 'auto',
          }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Message body */}
        <div style={{
          background: message.message_type === 'synthesis'
            ? `linear-gradient(135deg, ${agentStyle.lightColor}, rgba(196,160,53,0.08))`
            : agentStyle.lightColor,
          borderLeft: `3px ${typeConfig.borderStyle} ${
            message.message_type === 'synthesis' ? theme.colors.gold : agentStyle.color
          }`,
          borderRadius: `0 ${theme.radii.md} ${theme.radii.md} ${theme.radii.md}`,
          padding: '12px 16px',
          fontSize: '14px',
          lineHeight: 1.7,
          color: theme.colors.text,
          boxShadow: message.message_type === 'synthesis' ? theme.shadows.md : theme.shadows.sm,
          fontStyle: typeConfig.italic ? 'italic' : 'normal',
        }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: '0 0 8px 0', lastChild: { margin: 0 } as React.CSSProperties }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: agentStyle.color }}>{children}</strong>,
              ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>{children}</ul>,
              li: ({ children }) => <li style={{ marginBottom: '2px' }}>{children}</li>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
