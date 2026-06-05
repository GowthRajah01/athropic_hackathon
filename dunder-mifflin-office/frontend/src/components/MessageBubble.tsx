import ReactMarkdown from 'react-markdown';
import type { AgentMessage } from '../types';
import { theme } from '../styles/theme';
import { getAgentStyle } from '../styles/agents';

interface UserBubbleProps {
  content: string;
  userName: string;
  timestamp: string;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function fmtTime(iso: string) {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

/* ── User memo (secondary card — right-aligned, plain white) ───────────── */
export function UserBubble({ content, userName, timestamp }: UserBubbleProps) {
  return (
    <div className="memo-entry" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
      <div style={{ maxWidth: '78%' }}>
        {/* Memo card */}
        <div style={{
          background: theme.colors.userBubble,
          border: `1px solid ${theme.colors.borderGrey}`,
          borderTop: `4px solid ${theme.colors.grey}`,
          borderRadius: theme.radii.sm,
          padding: '12px 16px 14px',
          boxShadow: theme.shadows.memo,
        }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: theme.fonts.serif,
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: theme.colors.grey,
            fontWeight: 'bold',
            marginBottom: '6px',
          }}>
            Interoffice Memo
          </div>
          {/* Dotted divider */}
          <div style={{ borderBottom: `1px dotted ${theme.colors.borderGrey}`, marginBottom: '8px' }} />

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: theme.colors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: theme.fonts.serif,
              fontWeight: 'bold',
              fontSize: '13px',
              color: theme.colors.surface,
              flexShrink: 0,
            }}>
              {initials(userName)}
            </div>
            <div>
              <div style={{
                fontFamily: theme.fonts.serif,
                fontSize: '12px',
                color: theme.colors.grey,
              }}>
                FROM: <strong style={{ color: theme.colors.primary }}>{userName}</strong> · Staff
              </div>
              <div style={{
                fontFamily: theme.fonts.serif,
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: theme.colors.textLight,
              }}>
                {fmtTime(timestamp)}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="memo-body" style={{
            fontFamily: theme.fonts.mono,
            fontSize: '14px',
            lineHeight: 1.6,
            color: theme.colors.text,
            whiteSpace: 'pre-wrap',
          }}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Agent memo (primary Interoffice Memo card — left-aligned) ─────────── */
interface AgentBubbleProps {
  message: AgentMessage;
}

const typeConfig = {
  routing: {
    eyebrow: 'Routing Decision',
    topBorderColor: '#8C8276',
    italic: true,
  },
  specialist: {
    eyebrow: 'Interoffice Memo',
    topBorderColor: '#1B3A6B',
    italic: false,
  },
  synthesis: {
    eyebrow: 'Summary Memo',
    topBorderColor: '#C0392B',
    italic: false,
  },
};

export function AgentBubble({ message }: AgentBubbleProps) {
  const agentStyle = getAgentStyle(message.agent);
  const cfg = typeConfig[message.message_type] ?? typeConfig.specialist;

  return (
    <div className="memo-entry" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '18px' }}>
      <div style={{ maxWidth: '88%', minWidth: '260px' }}>
        <div style={{
          background: theme.colors.memoTint,
          border: `1px solid ${theme.colors.primary}`,
          borderTop: `4px solid ${cfg.topBorderColor}`,
          borderRadius: theme.radii.sm,
          padding: '12px 16px 14px',
          boxShadow: theme.shadows.memo,
        }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: theme.fonts.serif,
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: theme.colors.primary,
            fontWeight: 'bold',
            marginBottom: '6px',
          }}>
            {cfg.eyebrow}
          </div>
          {/* Dotted divider */}
          <div style={{ borderBottom: `1px dotted ${theme.colors.borderGrey}`, marginBottom: '8px' }} />

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: theme.colors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: theme.fonts.serif,
              fontWeight: 'bold',
              fontSize: '13px',
              color: theme.colors.surface,
              flexShrink: 0,
            }}>
              {agentStyle.monogram}
            </div>
            <div>
              <div style={{
                fontFamily: theme.fonts.serif,
                fontSize: '12px',
                color: theme.colors.grey,
              }}>
                FROM: <strong style={{ color: theme.colors.primary }}>{message.agent_display_name}</strong> · {agentStyle.department}
              </div>
              <div style={{
                fontFamily: theme.fonts.serif,
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: theme.colors.textLight,
              }}>
                {fmtTime(message.timestamp)}
              </div>
            </div>
            {message.message_type === 'synthesis' && (
              <div style={{
                marginLeft: 'auto',
                fontFamily: theme.fonts.mono,
                fontSize: '11px',
                fontWeight: 'bold',
                color: theme.colors.red,
                border: `2px solid ${theme.colors.red}`,
                padding: '2px 8px',
                borderRadius: theme.radii.sm,
                transform: 'rotate(-4deg)',
                letterSpacing: '0.18em',
                background: 'rgba(255,255,255,0.5)',
              }}>
                FINAL
              </div>
            )}
          </div>

          {/* Body */}
          <div className="memo-body" style={{
            fontFamily: theme.fonts.mono,
            fontSize: '14px',
            lineHeight: 1.6,
            color: theme.colors.text,
            fontStyle: cfg.italic ? 'italic' : 'normal',
          }}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                strong: ({ children }) => <strong style={{ color: theme.colors.primary }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>{children}</ul>,
                li: ({ children }) => <li style={{ marginBottom: '2px' }}>{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
