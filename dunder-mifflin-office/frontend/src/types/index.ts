export interface AgentMessage {
  id: string;
  timestamp: string;
  agent: string;
  agent_display_name: string;
  agent_emoji: string;
  agent_color: string;
  content: string;
  message_type: 'routing' | 'specialist' | 'synthesis';
}

export interface UserMessage {
  id: string;
  timestamp: string;
  content: string;
  role: 'user';
  user_name: string;
}

export type ChatMessage = UserMessage | (AgentMessage & { role: 'assistant' });

export interface RoutingInfo {
  agents: string[];
  michael_commentary: string;
}

export interface ChatResponse {
  messages: AgentMessage[];
  session_id: string;
  routing: RoutingInfo;
}

export interface AgentInfo {
  name: string;
  display_name: string;
  role: string;
  agent_type: string;
  avatar_color: string;
  emoji: string;
}

export interface SessionSummary {
  session_id: string;
  created_at: string;
  user_name: string;
  title: string;
  message_count: number;
  last_active: string;
}

export interface SessionHistoryResponse {
  session_id: string;
  user_name: string;
  title: string;
  messages: Array<Record<string, unknown>>;
}
