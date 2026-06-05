"""
Michael Scott as coordinator/router.
Routes the user's message to the right specialist agents.
"""

import json
import re
from dataclasses import dataclass

from anthropic import AsyncAnthropic

import config
from agent_loader import AgentDefinition

ROSTER_TABLE = {
    "dwight-schrute":  "sales strategy, threat assessment, operations, security, competitive analysis, paper products",
    "jim-halpert":     "client strategy, simplification, relationship intelligence, reality-checking, negotiations",
    "pam-beesly":      "communications, scheduling, coordination, document polish, general office questions, institutional memory",
    "ryan-howard":     "market analysis, pitch decks, innovation, new business, digital strategy, business cases",
    "angela-martin":   "budget review, compliance, expense audit, party planning, financial approval, accounting rules",
    "oscar-martinez":  "financial modelling, data analysis, fact-checking, research synthesis, ROI, numbers",
    "kelly-kapoor":    "customer sentiment, brand voice, trend intelligence, complaint resolution, customer experience",
    "toby-flenderson": "HR policy, legal risk, complaint investigation, workplace safety, employment law, contracts",
}

ROUTING_SUFFIX = """

## YOUR ROUTING TASK

A user has sent a message to the Scranton branch. You must decide which of your team members should handle it.

Your available specialists and their domains:
{roster}

Rules:
- Route to 1, 2, or 3 agents maximum. Don't over-delegate.
- Choose based on which specialists' domains best match the request.
- If it's a general question or you're unsure, route to pam-beesly.
- Always respond ONLY with a valid JSON object — no other text before or after.

JSON format:
{{
  "agents": ["agent-slug-1", "agent-slug-2"],
  "michael_commentary": "Your short, in-character sentence explaining your delegation decision (1-2 sentences max, you as Michael Scott)",
  "delegation_briefs": {{
    "agent-slug-1": "Specific brief for this agent — what you need from them",
    "agent-slug-2": "Specific brief for this agent — what you need from them"
  }}
}}

Valid agent slugs: {valid_slugs}
"""


@dataclass
class RoutingDecision:
    agents: list[str]
    michael_commentary: str
    delegation_briefs: dict[str, str]


def _build_roster_text() -> str:
    lines = []
    for slug, domain in ROSTER_TABLE.items():
        lines.append(f"- {slug}: {domain}")
    return "\n".join(lines)


def _extract_json(text: str) -> dict:
    """Extract JSON from model output, handling markdown code fences."""
    # Strip markdown fences if present
    clean = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    # Find the first { ... } block
    match = re.search(r"\{.*\}", clean, re.DOTALL)
    if match:
        return json.loads(match.group())
    return json.loads(clean)


async def route_message(
    user_message: str,
    conversation_history: list[dict],
    agents: dict[str, AgentDefinition],
    client: AsyncAnthropic,
) -> RoutingDecision:
    michael = agents.get("michael-scott")
    if not michael:
        return RoutingDecision(
            agents=["pam-beesly"],
            michael_commentary="Pam, handle this.",
            delegation_briefs={"pam-beesly": user_message},
        )

    roster_text = _build_roster_text()
    valid_slugs = list(ROSTER_TABLE.keys())

    system = michael.system_prompt + "\n\n" + ROUTING_SUFFIX.format(
        roster=roster_text,
        valid_slugs=", ".join(valid_slugs),
    )

    # Build messages: prior history (for context) + current user message
    messages = list(conversation_history[-6:])  # last 3 turns for routing context
    messages.append({"role": "user", "content": user_message})

    response = await client.messages.create(
        model=config.MODEL_ROUTER,
        max_tokens=512,
        system=system,
        messages=messages,
    )

    raw = response.content[0].text.strip()
    try:
        data = _extract_json(raw)
        chosen = [a for a in data.get("agents", []) if a in ROSTER_TABLE]
        if not chosen:
            chosen = ["pam-beesly"]
        briefs = {k: v for k, v in data.get("delegation_briefs", {}).items() if k in chosen}
        for agent in chosen:
            if agent not in briefs:
                briefs[agent] = user_message
        return RoutingDecision(
            agents=chosen,
            michael_commentary=data.get("michael_commentary", "I'm on it. Team, let's go!"),
            delegation_briefs=briefs,
        )
    except (json.JSONDecodeError, KeyError, ValueError):
        return RoutingDecision(
            agents=["pam-beesly"],
            michael_commentary="You know what, let me get Pam on this. She knows where everything is.",
            delegation_briefs={"pam-beesly": user_message},
        )
