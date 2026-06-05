# Dunder Mifflin Office — AI Agent Swarm

**The pitch:** The Scranton branch of Dunder Mifflin, but every employee is a living AI agent with their own personality, specialist skills, and growing institutional memory. Michael Scott coordinates. The team delivers (eventually).

This project combines two concepts:
- **Specialist Swarm** — a coordinator + specialist agent architecture where each agent owns a domain and has its own skills
- **Institutional Memory** — each agent maintains persistent memory across sessions, growing sharper, more opinionated, and more true to character over time

---

## Architecture

```
dunder-mifflin-office/
├── README.md                        (you are here)
└── agents/
    ├── michael-scott/               (coordinator)
    │   ├── prompt.md                — role, personality, decision-making style
    │   └── skills.md                — delegation, motivation, synthesis
    ├── dwight-schrute/              (sales & operations specialist)
    │   ├── prompt.md
    │   └── skills.md
    ├── jim-halpert/                 (client strategy specialist)
    │   ├── prompt.md
    │   └── skills.md
    ├── pam-beesly/                  (communications & institutional memory keeper)
    │   ├── prompt.md
    │   └── skills.md
    ├── ryan-howard/                 (strategy & market intelligence)
    │   ├── prompt.md
    │   └── skills.md
    ├── angela-martin/               (accounting & compliance)
    │   ├── prompt.md
    │   └── skills.md
    ├── oscar-martinez/              (financial analysis & fact-checking)
    │   ├── prompt.md
    │   └── skills.md
    ├── kelly-kapoor/                (customer experience & brand voice)
    │   ├── prompt.md
    │   └── skills.md
    └── toby-flenderson/             (HR, legal risk & compliance)
        ├── prompt.md
        └── skills.md
```

---

## The Agents

| Agent | Role | Type | Domain |
|---|---|---|---|
| **Michael Scott** | Regional Manager | Coordinator | Orchestration, delegation, synthesis |
| **Dwight Schrute** | Asst (to the) Regional Manager | Specialist | Sales strategy, threat assessment, operations |
| **Jim Halpert** | Sales Rep | Specialist | Client strategy, simplification, reality-checking |
| **Pam Beesly** | Office Administrator | Specialist | Communications, scheduling, institutional memory |
| **Ryan Howard** | Business Development | Specialist | Market analysis, strategy, pitch decks |
| **Angela Martin** | Head of Accounting | Specialist | Budget review, compliance, party planning |
| **Oscar Martinez** | Senior Accountant | Specialist | Financial modelling, data analysis, fact-checking |
| **Kelly Kapoor** | Customer Service | Specialist | Customer sentiment, brand voice, trend intelligence |
| **Toby Flenderson** | HR Representative | Specialist | HR policy, legal risk, complaint investigation |

---

## How the Two Concepts Combine

### Specialist Swarm Pattern
Michael Scott is the **coordinator**. When a task arrives (e.g. "Prepare a proposal for a new paper client"), he reads it, routes work to the relevant specialists in parallel, waits for their outputs, and synthesises a final deliverable. Each specialist has a defined domain and a set of skills that activate on the right trigger.

```
Task → Michael Scott (coordinator)
             ↓
    ┌────────┴────────────────┐
    ↓         ↓               ↓
  Dwight    Oscar           Toby
  (sales    (financials)    (contracts)
  strategy)
    └─────────┬──────────────┘
              ↓
         Michael synthesises
              ↓
         Pam polishes & sends
```

### Institutional Memory Pattern
Each agent maintains their own persistent memory store (via the Claude Memory tool). Their memory is character-consistent — they remember what their character would remember:
- **Michael** remembers relationships, anecdotes, and emotional moments
- **Dwight** remembers performance data, grudges, and security incidents
- **Oscar** remembers financial models and the times he was right
- **Pam** remembers everything procedural — she is the office's institutional backbone
- **Toby** remembers every complaint, ever, in detail

Over multiple sessions, the agents get sharper in character. Michael gets better at knowing which Chili's story closes the deal. Dwight's threat register grows. Oscar's financial models improve with real precedent. The swarm develops genuine institutional memory.

---

## What to Build Next

The agent definitions here are the foundation. The implementation will:

1. **Create the agents** via the Claude Managed Agents API, using each `prompt.md` as the system prompt
2. **Upload the skills** from each agent's `skills.md` via the Skills API
3. **Enable the Memory tool** on each agent so memory persists across sessions
4. **Wire the coordinator** — configure Michael to know his roster and dispatch to them
5. **Build the frontend** — a Dunder Mifflin-branded UI where you submit a task and watch the swarm work
6. **Run scenarios** — drop in a paper sales RFP, an HR complaint, a new client onboarding — and watch the team handle it in character

---

## Scenario Ideas

| Scenario | Trigger | Agents Involved |
|---|---|---|
| New client RFP | Paper company wants a proposal | Michael, Dwight, Jim, Oscar, Angela, Toby |
| Office party planning | Summer party brief | Michael, Angela, Kelly, Pam |
| Employee complaint | HR incident report | Toby, Angela, Michael, Pam |
| Market expansion pitch | New territory opportunity | Ryan, Oscar, Jim, Dwight, Michael |
| Client at risk | Renewal at risk, client unhappy | Jim, Kelly, Oscar, Michael |

---

## Why This Works as a Demo

- **Instantly recognisable characters** — the audience already knows the personalities, which means zero onboarding to understand the agents
- **Natural conflict and delegation** — the show's dynamics map perfectly to multi-agent tension: Dwight overdelivers, Jim simplifies, Toby says no, Michael takes credit
- **Memory makes the characters feel real** — when Dwight remembers the grudge from two sessions ago, and Michael remembers the client he took to Chili's, the agents feel like they have history
- **The absurdity is the feature** — Michael's synthesis is chaotic but warm; Toby's risk flags are ignored but documented; the output is recognisably Dunder Mifflin
