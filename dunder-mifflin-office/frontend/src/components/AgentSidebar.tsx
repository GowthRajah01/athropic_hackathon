import type { AgentInfo } from '../types';
import { theme } from '../styles/theme';
import { getAgentStyle } from '../styles/agents';

interface AgentSidebarProps {
  agents: AgentInfo[];
  activeAgents: string[];
}

function AgentCard({ agent, isActive }: { agent: AgentInfo; isActive: boolean }) {
  const style = getAgentStyle(agent.name);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      borderRadius: theme.radii.md,
      background: isActive ? style.lightColor : 'transparent',
      border: `1px solid ${isActive ? style.color : 'transparent'}`,
      transition: 'all 0.2s ease',
      marginBottom: '4px',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: isActive ? style.color : theme.colors.surfaceAlt,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        boxShadow: isActive ? `0 0 0 3px ${style.lightColor}` : 'none',
      }}>
        {style.emoji}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: isActive ? style.color : theme.colors.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 0.2s ease',
        }}>
          {agent.display_name}
        </div>
        <div style={{
          fontSize: '10px',
          color: theme.colors.textMuted,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {agent.role.split('—')[0].trim()}
        </div>
      </div>
      {isActive && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: style.color,
          flexShrink: 0,
          animation: 'pulse 1s ease-in-out infinite',
        }} />
      )}
    </div>
  );
}

export default function AgentSidebar({ agents, activeAgents }: AgentSidebarProps) {
  const coordinator = agents.filter(a => a.agent_type === 'coordinator');
  const specialists = agents.filter(a => a.agent_type === 'specialist');

  return (
    <aside style={{
      width: '260px',
      background: theme.colors.surface,
      borderLeft: `1px solid ${theme.colors.border}`,
      padding: '16px 12px',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{
        fontFamily: theme.fonts.heading,
        fontSize: '13px',
        fontWeight: 'bold',
        color: theme.colors.primary,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        Scranton Branch
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: '600',
          color: theme.colors.textMuted,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          paddingLeft: '12px',
        }}>
          Management
        </div>
        {coordinator.map(agent => (
          <AgentCard key={agent.name} agent={agent} isActive={activeAgents.includes(agent.name)} />
        ))}
      </div>

      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: '600',
          color: theme.colors.textMuted,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          paddingLeft: '12px',
        }}>
          Team
        </div>
        {specialists.map(agent => (
          <AgentCard key={agent.name} agent={agent} isActive={activeAgents.includes(agent.name)} />
        ))}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: theme.colors.surfaceAlt,
        borderRadius: theme.radii.md,
        border: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ fontSize: '11px', color: theme.colors.textMuted, fontStyle: 'italic', lineHeight: 1.5 }}>
          "That's what she said."
        </div>
        <div style={{ fontSize: '10px', color: theme.colors.textLight, marginTop: '4px' }}>
          — Michael Scott
        </div>
      </div>
    </aside>
  );
}
