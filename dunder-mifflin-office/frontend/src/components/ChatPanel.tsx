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
          userName: msg.user_name as string ?? 'User',
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
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      background: theme.colors.background,
    }}>
      {allMessages.length === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.textMuted,
          gap: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px' }}>🏢</div>
          <div style={{
            fontFamily: theme.fonts.heading,
            fontSize: '22px',
            color: theme.colors.primary,
          }}>
            Welcome to the Scranton Branch
          </div>
          <div style={{ fontSize: '14px', maxWidth: '380px', lineHeight: 1.6 }}>
            Ask us anything about paper, sales, HR, compliance, or the inner workings of Dunder Mifflin.
            Michael and the team are standing by.
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '8px',
          }}>
            {[
              'Prepare a proposal for a new client',
              'Plan the summer office party',
              'Someone filed an HR complaint',
              'What are our paper pricing tiers?',
            ].map(suggestion => (
              <div key={suggestion} style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.pill,
                padding: '6px 14px',
                fontSize: '12px',
                color: theme.colors.textMuted,
                cursor: 'default',
              }}>
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

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

      {loadingPhase && (
        <TypingIndicator activeAgents={activeAgents} phase={loadingPhase} />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
