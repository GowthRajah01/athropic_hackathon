import type { AgentInfo } from '../types';
import { theme } from '../styles/theme';
import { getAgentStyle } from '../styles/agents';

interface AgentSidebarProps {
  agents: AgentInfo[];
  activeAgents: string[];
}

function AgentRow({ agent, isActive }: { agent: AgentInfo; isActive: boolean }) {
  const style = getAgentStyle(agent.name);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 10px',
      borderRadius: theme.radii.sm,
      background: isActive ? 'rgba(27,58,107,0.07)' : 'transparent',
      border: `1px solid ${isActive ? theme.colors.primary : 'transparent'}`,
      marginBottom: '4px',
      transition: 'background 0.2s ease, border-color 0.2s ease',
    }}>
      {/* Monogram circle */}
      <div style={{
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        background: theme.colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: theme.fonts.serif,
        fontWeight: 'bold',
        fontSize: '12px',
        color: theme.colors.surface,
        flexShrink: 0,
        opacity: isActive ? 1 : 0.6,
        transition: 'opacity 0.2s ease',
      }}>
        {style.monogram}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: theme.fonts.serif,
          fontSize: '12px',
          fontWeight: 'bold',
          color: isActive ? theme.colors.primary : theme.colors.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {agent.display_name}
        </div>
        <div style={{
          fontFamily: theme.fonts.serif,
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.colors.grey,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {style.department}
        </div>
      </div>

      {/* Active status dot */}
      {isActive && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: theme.colors.red,
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
      width: '230px',
      background: theme.colors.surface,
      borderLeft: `2px solid ${theme.colors.primary}`,
      padding: '16px 12px',
      overflowY: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Title */}
      <div style={{
        fontFamily: theme.fonts.serif,
        fontSize: '11px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: theme.colors.primary,
        fontWeight: 'bold',
        paddingBottom: '8px',
        borderBottom: `1px solid ${theme.colors.primary}`,
      }}>
        Staff Directory
      </div>

      {/* Management section */}
      <div>
        <div style={{
          fontFamily: theme.fonts.serif,
          fontSize: '10px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme.colors.grey,
          marginBottom: '6px',
        }}>
          Management
        </div>
        {coordinator.map(agent => (
          <AgentRow key={agent.name} agent={agent} isActive={activeAgents.includes(agent.name)} />
        ))}
      </div>

      {/* Team section */}
      <div>
        <div style={{
          fontFamily: theme.fonts.serif,
          fontSize: '10px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme.colors.grey,
          marginBottom: '6px',
        }}>
          Team
        </div>
        {specialists.map(agent => (
          <AgentRow key={agent.name} agent={agent} isActive={activeAgents.includes(agent.name)} />
        ))}
      </div>

      {/* Quote footer */}
      <div style={{
        marginTop: 'auto',
        padding: '10px 12px',
        background: theme.colors.memoTint,
        border: `1px solid ${theme.colors.borderGrey}`,
        borderLeft: `3px solid ${theme.colors.primary}`,
        borderRadius: theme.radii.sm,
      }}>
        <div style={{
          fontFamily: theme.fonts.serif,
          fontSize: '11px',
          fontStyle: 'italic',
          color: theme.colors.grey,
          lineHeight: 1.5,
        }}>
          "That's what she said."
        </div>
        <div style={{
          fontFamily: theme.fonts.serif,
          fontSize: '10px',
          color: theme.colors.textLight,
          marginTop: '4px',
          letterSpacing: '0.08em',
        }}>
          — Michael Scott, Regional Manager
        </div>
      </div>
    </aside>
  );
}
