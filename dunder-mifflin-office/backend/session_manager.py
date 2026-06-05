"""Session creation and management."""

import uuid
from datetime import datetime, timezone

import memory


def create_session(user_name: str = "User", title: str = "") -> dict:
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    session_data = {
        "session_id": session_id,
        "created_at": now,
        "user_name": user_name,
        "title": title or f"Session — {user_name}",
        "messages": [],
    }
    memory.save_session(session_data)
    memory.upsert_session_index(memory.build_session_summary(session_data))
    return session_data


def get_session(session_id: str) -> dict:
    return memory.load_session(session_id)


def get_conversation_history(session_id: str, limit: int = 20) -> list[dict]:
    """Return last N messages formatted for Claude conversation context."""
    session = memory.load_session(session_id)
    messages = session.get("messages", [])[-limit:]
    history = []
    for msg in messages:
        role = msg.get("role", "assistant")
        content = msg.get("content", "")
        if role in ("user", "assistant") and content:
            history.append({"role": role, "content": content})
    return history
