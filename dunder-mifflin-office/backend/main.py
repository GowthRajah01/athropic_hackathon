"""
FastAPI application — Dunder Mifflin Office AI Swarm
"""

import asyncio
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from anthropic import AsyncAnthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import agent_runner
import config
import memory
import router
import session_manager
from agent_loader import AgentDefinition, load_all_agents
from models import (
    AgentInfo,
    AgentMessage,
    ChatRequest,
    ChatResponse,
    CreateSessionRequest,
    RoutingInfo,
    SessionHistoryResponse,
    SessionSummary,
)

load_dotenv()

AGENTS: dict[str, AgentDefinition] = {}
CLIENT: AsyncAnthropic = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global AGENTS, CLIENT
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.")

    CLIENT = AsyncAnthropic(api_key=api_key)
    AGENTS = load_all_agents()

    config.MEMORY_AGENTS_DIR.mkdir(parents=True, exist_ok=True)
    config.MEMORY_SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Loaded {len(AGENTS)} agents: {list(AGENTS.keys())}")
    yield


app = FastAPI(title="Dunder Mifflin Office API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/agents", response_model=list[AgentInfo])
async def get_agents():
    return [
        AgentInfo(
            name=a.name,
            display_name=a.display_name,
            role=a.role,
            agent_type=a.agent_type,
            avatar_color=a.avatar_color,
            emoji=a.emoji,
        )
        for a in AGENTS.values()
    ]


@app.get("/api/sessions", response_model=list[SessionSummary])
async def get_sessions():
    index = memory.load_session_index()
    return [SessionSummary(**s) for s in index]


@app.post("/api/sessions", response_model=SessionSummary)
async def create_session(req: CreateSessionRequest):
    session = session_manager.create_session(user_name=req.user_name, title=req.title)
    summary = memory.build_session_summary(session)
    return SessionSummary(**summary)


@app.get("/api/sessions/{session_id}", response_model=SessionHistoryResponse)
async def get_session_history(session_id: str):
    session = memory.load_session(session_id)
    return SessionHistoryResponse(
        session_id=session["session_id"],
        user_name=session.get("user_name", "User"),
        title=session.get("title", "Session"),
        messages=session.get("messages", []),
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    session = memory.load_session(req.session_id)
    if not session.get("messages") and session.get("session_id") != req.session_id:
        raise HTTPException(status_code=404, detail="Session not found.")

    conversation_history = session_manager.get_conversation_history(req.session_id)
    now = datetime.now(timezone.utc).isoformat()

    # Save user message to session
    user_msg_record = {
        "id": str(uuid.uuid4()),
        "timestamp": now,
        "role": "user",
        "agent": None,
        "content": req.message,
        "user_name": req.user_name,
        "message_type": "user",
    }
    memory.append_message_to_session(req.session_id, user_msg_record)

    # 1. Route via Michael
    routing_decision = await router.route_message(
        user_message=req.message,
        conversation_history=conversation_history,
        agents=AGENTS,
        client=CLIENT,
    )

    output_messages: list[AgentMessage] = []
    michael = AGENTS.get("michael-scott")

    # 2. Michael's delegation commentary as the first message
    michael_color = michael.avatar_color if michael else "#1a3c5e"
    michael_emoji = michael.emoji if michael else "🏆"
    routing_msg = AgentMessage(
        id=str(uuid.uuid4()),
        timestamp=datetime.now(timezone.utc).isoformat(),
        agent="michael-scott",
        agent_display_name="Michael Scott",
        agent_emoji=michael_emoji,
        agent_color=michael_color,
        content=routing_decision.michael_commentary,
        message_type="routing",
    )
    output_messages.append(routing_msg)

    # Save routing message to session
    memory.append_message_to_session(req.session_id, {
        **routing_msg.model_dump(),
        "role": "assistant",
    })

    # 3. Run specialists in parallel
    specialist_results = await agent_runner.run_agents_parallel(
        agent_names=routing_decision.agents,
        agents=AGENTS,
        user_message=req.message,
        delegation_briefs=routing_decision.delegation_briefs,
        conversation_history=conversation_history,
        client=CLIENT,
    )

    # Build specialist messages
    for agent_name, response_text in specialist_results:
        agent = AGENTS.get(agent_name)
        if not agent:
            continue
        specialist_msg = AgentMessage(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc).isoformat(),
            agent=agent.name,
            agent_display_name=agent.display_name,
            agent_emoji=agent.emoji,
            agent_color=agent.avatar_color,
            content=response_text,
            message_type="specialist",
        )
        output_messages.append(specialist_msg)
        memory.append_message_to_session(req.session_id, {
            **specialist_msg.model_dump(),
            "role": "assistant",
        })

    # 4. Michael synthesises (only if >1 specialist responded)
    if len(specialist_results) > 1:
        synthesis_text = await agent_runner.synthesize_with_michael(
            user_message=req.message,
            specialist_responses=specialist_results,
            agents=AGENTS,
            conversation_history=conversation_history,
            client=CLIENT,
        )
        synthesis_msg = AgentMessage(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc).isoformat(),
            agent="michael-scott",
            agent_display_name="Michael Scott",
            agent_emoji=michael_emoji,
            agent_color=michael_color,
            content=synthesis_text,
            message_type="synthesis",
        )
        output_messages.append(synthesis_msg)
        memory.append_message_to_session(req.session_id, {
            **synthesis_msg.model_dump(),
            "role": "assistant",
        })

    # 5. Update session index with latest activity
    updated_session = memory.load_session(req.session_id)
    memory.upsert_session_index(memory.build_session_summary(updated_session))

    # 6. Background: extract memories (fire and forget)
    asyncio.create_task(_extract_memories_background(
        specialist_results=specialist_results,
        session_id=req.session_id,
        user_message=req.message,
    ))

    return ChatResponse(
        messages=output_messages,
        session_id=req.session_id,
        routing=RoutingInfo(
            agents=routing_decision.agents,
            michael_commentary=routing_decision.michael_commentary,
        ),
    )


async def _extract_memories_background(
    specialist_results: list[tuple[str, str]],
    session_id: str,
    user_message: str,
) -> None:
    tasks = []
    for agent_name, response_text in specialist_results:
        tasks.append(agent_runner.extract_and_save_memory(
            agent_name=agent_name,
            session_id=session_id,
            user_message=user_message,
            agent_response=response_text,
            client=CLIENT,
        ))
    await asyncio.gather(*tasks, return_exceptions=True)
