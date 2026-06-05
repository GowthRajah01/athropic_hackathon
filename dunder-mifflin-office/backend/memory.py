"""
JSON file-based memory system.
- Agent institutional memory: memory/agents/{agent-name}.json
- Session conversation history: memory/sessions/{session-id}.json
"""

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

import config

_locks: dict[str, threading.Lock] = {}
_locks_mutex = threading.Lock()


def _get_lock(path: str) -> threading.Lock:
    with _locks_mutex:
        if path not in _locks:
            _locks[path] = threading.Lock()
        return _locks[path]


def _read_json(path: Path, default):
    if not path.exists():
        return default
    with _get_lock(str(path)):
        try:
            return json.loads(path.read_text())
        except (json.JSONDecodeError, OSError):
            return default


def _write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with _get_lock(str(path)):
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


# ── Agent institutional memory ─────────────────────────────────────────────

def load_agent_memory(agent_name: str, limit: int = config.MAX_MEMORY_ENTRIES) -> list[dict]:
    path = config.MEMORY_AGENTS_DIR / f"{agent_name}.json"
    data = _read_json(path, {"agent": agent_name, "entries": []})
    entries = data.get("entries", [])
    return entries[-limit:]


def save_agent_memory_entries(agent_name: str, session_id: str, new_entries: list[dict]) -> None:
    path = config.MEMORY_AGENTS_DIR / f"{agent_name}.json"
    data = _read_json(path, {"agent": agent_name, "entries": []})
    for entry in new_entries:
        entry.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
        entry.setdefault("session_id", session_id)
    data["entries"].extend(new_entries)
    _write_json(path, data)


# ── Session conversation history ───────────────────────────────────────────

def load_session(session_id: str) -> dict:
    path = config.MEMORY_SESSIONS_DIR / f"{session_id}.json"
    return _read_json(path, {
        "session_id": session_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "user_name": "User",
        "title": "New Session",
        "messages": [],
    })


def save_session(session_data: dict) -> None:
    path = config.MEMORY_SESSIONS_DIR / f"{session_data['session_id']}.json"
    _write_json(path, session_data)


def append_message_to_session(session_id: str, message: dict) -> None:
    session = load_session(session_id)
    session["messages"].append(message)
    save_session(session)


# ── Session index ──────────────────────────────────────────────────────────

def load_session_index() -> list[dict]:
    return _read_json(config.SESSION_INDEX_FILE, [])


def upsert_session_index(summary: dict) -> None:
    index = load_session_index()
    existing = next((i for i, s in enumerate(index) if s["session_id"] == summary["session_id"]), None)
    if existing is not None:
        index[existing] = summary
    else:
        index.insert(0, summary)
    _write_json(config.SESSION_INDEX_FILE, index)


def build_session_summary(session_data: dict) -> dict:
    messages = session_data.get("messages", [])
    return {
        "session_id": session_data["session_id"],
        "created_at": session_data.get("created_at", ""),
        "user_name": session_data.get("user_name", "User"),
        "title": session_data.get("title", "New Session"),
        "message_count": len(messages),
        "last_active": messages[-1]["timestamp"] if messages else session_data.get("created_at", ""),
    }
