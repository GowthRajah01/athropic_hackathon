from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
AGENTS_DIR = BASE_DIR / "agents"
MEMORY_DIR = BASE_DIR / "memory"
MEMORY_AGENTS_DIR = MEMORY_DIR / "agents"
MEMORY_SESSIONS_DIR = MEMORY_DIR / "sessions"
SESSION_INDEX_FILE = MEMORY_SESSIONS_DIR / "_index.json"

MODEL_ROUTER = "claude-haiku-4-5-20251001"
MODEL_AGENT = "claude-sonnet-4-6"
MODEL_SYNTHESIS = "claude-sonnet-4-6"
MODEL_MEMORY = "claude-haiku-4-5-20251001"

MAX_MEMORY_ENTRIES = 20
MAX_CONVERSATION_HISTORY = 20

AVATAR_COLORS = {
    "michael-scott":   "#1a3c5e",
    "dwight-schrute":  "#5c3d1a",
    "jim-halpert":     "#2e7d32",
    "pam-beesly":      "#7b4397",
    "ryan-howard":     "#e65100",
    "angela-martin":   "#880e4f",
    "oscar-martinez":  "#00695c",
    "kelly-kapoor":    "#d81b60",
    "toby-flenderson": "#546e7a",
}

AGENT_EMOJIS = {
    "michael-scott":   "🏆",
    "dwight-schrute":  "🥋",
    "jim-halpert":     "😏",
    "pam-beesly":      "🎨",
    "ryan-howard":     "📊",
    "angela-martin":   "🐱",
    "oscar-martinez":  "📈",
    "kelly-kapoor":    "💅",
    "toby-flenderson": "📋",
}
