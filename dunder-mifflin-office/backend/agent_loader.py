"""
Scans the agents/ directory, parses each agent's prompt.md and skills.md,
and builds an in-memory registry of AgentDefinition objects.
"""

from dataclasses import dataclass
from pathlib import Path
import yaml
import config


@dataclass
class AgentDefinition:
    name: str
    display_name: str
    role: str
    agent_type: str
    system_prompt: str
    skills_prompt: str
    avatar_color: str
    emoji: str


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split YAML frontmatter from markdown body."""
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    try:
        meta = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError:
        meta = {}
    return meta, parts[2].strip()


def _slug_to_display(slug: str) -> str:
    return " ".join(word.capitalize() for word in slug.split("-"))


def load_all_agents() -> dict[str, AgentDefinition]:
    agents: dict[str, AgentDefinition] = {}

    for agent_dir in sorted(config.AGENTS_DIR.iterdir()):
        if not agent_dir.is_dir():
            continue

        prompt_file = agent_dir / "prompt.md"
        skills_file = agent_dir / "skills.md"

        if not prompt_file.exists():
            continue

        raw_prompt = prompt_file.read_text()
        meta, prompt_body = _parse_frontmatter(raw_prompt)

        name = meta.get("name") or agent_dir.name
        role = meta.get("role", "Office Employee")
        agent_type = meta.get("agent_type", "specialist")
        display_name = _slug_to_display(name)

        skills_body = skills_file.read_text() if skills_file.exists() else ""

        agents[name] = AgentDefinition(
            name=name,
            display_name=display_name,
            role=role,
            agent_type=agent_type,
            system_prompt=prompt_body,
            skills_prompt=skills_body,
            avatar_color=config.AVATAR_COLORS.get(name, "#666666"),
            emoji=config.AGENT_EMOJIS.get(name, "👤"),
        )

    return agents
