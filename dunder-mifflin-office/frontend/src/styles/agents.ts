export interface AgentStyle {
  color: string;
  lightColor: string;
  emoji: string;
  label: string;
}

export const agentStyles: Record<string, AgentStyle> = {
  'michael-scott':   { color: '#1a3c5e', lightColor: '#e8eff7', emoji: '🏆', label: 'Michael Scott' },
  'dwight-schrute':  { color: '#5c3d1a', lightColor: '#f5ede0', emoji: '🥋', label: 'Dwight Schrute' },
  'jim-halpert':     { color: '#2e7d32', lightColor: '#e8f5e9', emoji: '😏', label: 'Jim Halpert' },
  'pam-beesly':      { color: '#7b4397', lightColor: '#f3e8fa', emoji: '🎨', label: 'Pam Beesly' },
  'ryan-howard':     { color: '#e65100', lightColor: '#fbe9e7', emoji: '📊', label: 'Ryan Howard' },
  'angela-martin':   { color: '#880e4f', lightColor: '#fce4ec', emoji: '🐱', label: 'Angela Martin' },
  'oscar-martinez':  { color: '#00695c', lightColor: '#e0f2f1', emoji: '📈', label: 'Oscar Martinez' },
  'kelly-kapoor':    { color: '#d81b60', lightColor: '#fce4ec', emoji: '💅', label: 'Kelly Kapoor' },
  'toby-flenderson': { color: '#546e7a', lightColor: '#eceff1', emoji: '📋', label: 'Toby Flenderson' },
};

export function getAgentStyle(agentName: string): AgentStyle {
  return agentStyles[agentName] ?? { color: '#666', lightColor: '#f0f0f0', emoji: '👤', label: agentName };
}
