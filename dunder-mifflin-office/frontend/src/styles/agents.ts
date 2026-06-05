export interface AgentStyle {
  monogram: string;
  department: string;
  label: string;
}

export const agentStyles: Record<string, AgentStyle> = {
  'michael-scott':   { monogram: 'MS', department: 'Management',   label: 'Michael Scott'    },
  'dwight-schrute':  { monogram: 'DS', department: 'Sales',        label: 'Dwight Schrute'   },
  'jim-halpert':     { monogram: 'JH', department: 'Sales',        label: 'Jim Halpert'      },
  'pam-beesly':      { monogram: 'PB', department: 'Reception',    label: 'Pam Beesly'       },
  'ryan-howard':     { monogram: 'RH', department: 'Strategy',     label: 'Ryan Howard'      },
  'angela-martin':   { monogram: 'AM', department: 'Accounting',   label: 'Angela Martin'    },
  'oscar-martinez':  { monogram: 'OM', department: 'Accounting',   label: 'Oscar Martinez'   },
  'kelly-kapoor':    { monogram: 'KK', department: 'Customer Svc', label: 'Kelly Kapoor'     },
  'toby-flenderson': { monogram: 'TF', department: 'HR',           label: 'Toby Flenderson'  },
};

export function getAgentStyle(agentName: string): AgentStyle {
  return agentStyles[agentName] ?? { monogram: agentName.slice(0, 2).toUpperCase(), department: 'Staff', label: agentName };
}
