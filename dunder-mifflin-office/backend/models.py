from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_name: str = "User"


class AgentMessage(BaseModel):
    id: str
    timestamp: str
    agent: str
    agent_display_name: str
    agent_emoji: str
    agent_color: str
    content: str
    message_type: str  # "routing" | "specialist" | "synthesis"


class RoutingInfo(BaseModel):
    agents: list[str]
    michael_commentary: str


class ChatResponse(BaseModel):
    messages: list[AgentMessage]
    session_id: str
    routing: RoutingInfo


class AgentInfo(BaseModel):
    name: str
    display_name: str
    role: str
    agent_type: str
    avatar_color: str
    emoji: str


class SessionSummary(BaseModel):
    session_id: str
    created_at: str
    user_name: str
    title: str
    message_count: int
    last_active: str


class CreateSessionRequest(BaseModel):
    user_name: str = "User"
    title: str = ""


class SessionHistoryResponse(BaseModel):
    session_id: str
    user_name: str
    title: str
    messages: list[dict]
