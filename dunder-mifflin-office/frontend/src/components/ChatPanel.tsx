import { useEffect, useRef } from 'react';
import type { AgentMessage, SessionHistoryResponse } from '../types';
import { UserBubble, AgentBubble } from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { theme } from '../styles/theme';

interface DisplayMessage {
  id: string;
  timestamp: string;
  type: 'user' | 'agent';
  content: string;
  userName?: string;
  agentMessage?: AgentMessage;
}

interface ChatPanelProps {
  pendingMessages: DisplayMessage[];
  history: SessionHistoryResponse | null;
  activeAgents: string[];
  loadingPhase: 'routing' | 'specialists' | 'synthesis' | null;
  userName: string;
}

function buildDisplayMessages(history: SessionHistoryResponse | null): DisplayMessage[] {
  if (!history) return [];
  return history.messages
    .filter(m => {
      const r = (m as Record<string, unknown>).role as string;
      return r === 'user' || r === 'assistant';
    })
    .map(m => {
      const msg = m as Record<string, unknown>;
      const role = msg.role as string;
      if (role === 'user') {
        return {
          id: msg.id as string,
          timestamp: msg.timestamp as string,
          type: 'user' as const,
          content: msg.content as string,
          userName: (msg.user_name as string) ?? 'Staff',
        };
      }
      return {
        id: msg.id as string,
        timestamp: msg.timestamp as string,
        type: 'agent' as const,
        content: msg.content as string,
        agentMessage: {
          id: msg.id as string,
          timestamp: msg.timestamp as string,
          agent: msg.agent as string,
          agent_display_name: msg.agent_display_name as string,
          agent_emoji: msg.agent_emoji as string,
          agent_color: msg.agent_color as string,
          content: msg.content as string,
          message_type: msg.message_type as 'routing' | 'specialist' | 'synthesis',
        },
      };
    });
}

const RULED_BG = `repeating-linear-gradient(
  to bottom,
  transparent 0px,
  transparent 27px,
  rgba(27,58,107,0.07) 27px,
  rgba(27,58,107,0.07) 28px
)`;

export default function ChatPanel({
  pendingMessages,
  history,
  activeAgents,
  loadingPhase,
  userName,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const historicMessages = buildDisplayMessages(history);
  const allMessages = [...historicMessages, ...pendingMessages];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length, loadingPhase]);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      background: `${RULED_BG}, ${theme.colors.background}`,
    }}>
      {allMessages.length === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          textAlign: 'center',
        }}>
          {/* Welcome memo card */}
          <div style={{
            background: theme.colors.memoTint,
            border: `1px solid ${theme.colors.primary}`,
            borderTop: `4px solid ${theme.colors.primary}`,
            borderRadius: theme.radii.sm,
            padding: '28px 36px',
            maxWidth: '480px',
            boxShadow: theme.shadows.memo,
          }}>
            <div style={{
              fontFamily: theme.fonts.serif,
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: theme.colors.primary,
              fontWeight: 'bold',
              marginBottom: '8px',
            }}>
              Welcome Notice
            </div>
            <div style={{ borderBottom: `1px dotted ${theme.colors.borderGrey}`, marginBottom: '14px' }} />
            <div style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '26px',
              color: theme.colors.primary,
              marginBottom: '10px',
              letterSpacing: '-0.02em',
            }}>
              Welcome to the<br />Scranton Branch
            </div>
            <div style={{
              fontFamily: theme.fonts.mono,
              fontSize: '13px',
              lineHeight: 1.7,
              color: theme.colors.text,
              marginBottom: '18px',
            }}>
              Submit a memo below. Michael and the team<br />
              are standing by to assist with paper, sales,<br />
              HR matters, compliance, and more.
            </div>
            <div style={{ borderBottom: `1px dotted ${theme.colors.borderGrey}`, marginBottom: '14px' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {[
                'Prepare a proposal for a new client',
                'Plan the summer office party',
                'Someone filed an HR complaint',
                'What are our paper pricing tiers?',
              ].map(s => (
                <div key={s} style={{
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.borderGrey}`,
                  borderRadius: theme.radii.sm,
                  padding: '5px 12px',
                  fontFamily: theme.fonts.mono,
                  fontSize: '11px',
                  color: theme.colors.grey,
                }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {allMessages.map(msg => {
          if (msg.type === 'user') {
            return (
              <UserBubble
                key={msg.id}
                content={msg.content}
                userName={msg.userName ?? userName}
                timestamp={msg.timestamp}
              />
            );
          }
          if (msg.agentMessage) {
            return <AgentBubble key={msg.id} message={msg.agentMessage} />;
          }
          return null;
        })}
      </div>

      {loadingPhase && (
        <TypingIndicator activeAgents={activeAgents} phase={loadingPhase} />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
