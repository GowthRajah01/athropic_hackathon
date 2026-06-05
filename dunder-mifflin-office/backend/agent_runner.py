"""
Runs individual specialist agents and Michael's synthesis pass.
Memory extraction is also handled here (async, background).
"""

import asyncio
import json
import re
from datetime import datetime, timezone

from anthropic import AsyncAnthropic

import config
import memory
from agent_loader import AgentDefinition

SPECIALIST_SUFFIX = """

## YOUR SKILLS
{skills}

## YOUR MEMORIES FROM PAST SESSIONS
{memories}

## CURRENT DELEGATION
Michael Scott (Regional Manager) has delegated this to you.
Michael's brief: "{brief}"

The user originally said: "{user_message}"

Respond in character. Be concise — 2-4 paragraphs. Stay completely in your character's voice.
Do not break character or acknowledge that you are an AI.
"""

SYNTHESIS_PROMPT = """
## SYNTHESIS TASK

Your specialists have reported back. Here are their responses:

{specialist_responses}

The user's original message was: "{user_message}"

Now synthesise their work into a final response. Stay in character as Michael Scott — enthusiastic, heartfelt, slightly tangential. Take appropriate credit, give the team a shoutout, and produce a clear final summary that answers the user. Keep it to 2-3 paragraphs.
"""

MEMORY_EXTRACTION_PROMPT = """
You are reviewing an interaction involving {agent_name} from Dunder Mifflin.

User message: {user_message}
Agent response: {agent_response}

Extract 0-3 memory entries that {agent_name} should retain for future sessions.
Only include things that are genuinely worth remembering long-term (facts about the user, decisions made, preferences learned, important context).
Do not include trivial or ephemeral details.

Respond ONLY with a JSON array:
[
  {{"type": "fact|preference|precedent|relationship", "content": "The specific thing to remember", "tags": ["tag1", "tag2"]}}
]

If nothing is worth remembering, return an empty array: []
"""


def _format_memories(entries: list[dict]) -> str:
    if not entries:
        return "No prior memories yet."
    lines = []
    for e in entries:
        ts = e.get("timestamp", "")[:10]
        content = e.get("content", "")
        lines.append(f"- [{ts}] {content}")
    return "\n".join(lines)


async def run_agent(
    agent: AgentDefinition,
    user_message: str,
    brief: str,
    conversation_history: list[dict],
    client: AsyncAnthropic,
) -> str:
    memory_entries = memory.load_agent_memory(agent.name)
    memories_text = _format_memories(memory_entries)

    system = agent.system_prompt + "\n\n" + SPECIALIST_SUFFIX.format(
        skills=agent.skills_prompt,
        memories=memories_text,
        brief=brief,
        user_message=user_message,
    )

    # Include recent conversation for context
    messages = list(conversation_history[-8:])
    messages.append({"role": "user", "content": user_message})

    response = await client.messages.create(
        model=config.MODEL_AGENT,
        max_tokens=1024,
        system=system,
        messages=messages,
    )
    return response.content[0].text.strip()


async def run_agents_parallel(
    agent_names: list[str],
    agents: dict[str, AgentDefinition],
    user_message: str,
    delegation_briefs: dict[str, str],
    conversation_history: list[dict],
    client: AsyncAnthropic,
) -> list[tuple[str, str]]:
    """Run specialists in parallel. Returns list of (agent_name, response_text)."""
    tasks = []
    for name in agent_names:
        agent = agents.get(name)
        if not agent:
            continue
        brief = delegation_briefs.get(name, user_message)
        tasks.append((name, run_agent(agent, user_message, brief, conversation_history, client)))

    results = await asyncio.gather(*[t for _, t in tasks], return_exceptions=True)

    output = []
    for (name, _), result in zip(tasks, results):
        if isinstance(result, Exception):
            output.append((name, f"[{name} encountered an error: {result}]"))
        else:
            output.append((name, result))
    return output


async def synthesize_with_michael(
    user_message: str,
    specialist_responses: list[tuple[str, str]],
    agents: dict[str, AgentDefinition],
    conversation_history: list[dict],
    client: AsyncAnthropic,
) -> str:
    michael = agents.get("michael-scott")
    if not michael:
        return "Thanks everyone. Great work. Really great work."

    formatted = []
    for name, text in specialist_responses:
        agent = agents.get(name)
        display = agent.display_name if agent else name
        formatted.append(f"**{display}:** {text}")

    specialist_block = "\n\n".join(formatted)

    michael_memories = memory.load_agent_memory("michael-scott")
    memories_text = _format_memories(michael_memories)

    system = michael.system_prompt + f"\n\n## YOUR MEMORIES\n{memories_text}"

    messages = list(conversation_history[-6:])
    messages.append({
        "role": "user",
        "content": SYNTHESIS_PROMPT.format(
            specialist_responses=specialist_block,
            user_message=user_message,
        )
    })

    response = await client.messages.create(
        model=config.MODEL_SYNTHESIS,
        max_tokens=1024,
        system=system,
        messages=messages,
    )
    return response.content[0].text.strip()


async def extract_and_save_memory(
    agent_name: str,
    session_id: str,
    user_message: str,
    agent_response: str,
    client: AsyncAnthropic,
) -> None:
    """Background task: extract memorable facts and append to agent memory."""
    try:
        prompt = MEMORY_EXTRACTION_PROMPT.format(
            agent_name=agent_name,
            user_message=user_message,
            agent_response=agent_response,
        )
        response = await client.messages.create(
            model=config.MODEL_MEMORY,
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        # Strip markdown fences
        clean = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`").strip()
        entries = json.loads(clean)
        if isinstance(entries, list) and entries:
            memory.save_agent_memory_entries(agent_name, session_id, entries)
    except Exception:
        pass  # Memory extraction is best-effort
