#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================"
echo "  Dunder Mifflin — Scranton Branch AI"
echo "  Limitless Paper in a Paperless World"
echo "============================================"
echo ""

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
  if [ -f "$SCRIPT_DIR/backend/.env" ]; then
    echo "Loading ANTHROPIC_API_KEY from backend/.env"
    export $(grep -v '^#' "$SCRIPT_DIR/backend/.env" | xargs)
  else
    echo "ERROR: ANTHROPIC_API_KEY not set."
    echo "  Option 1: export ANTHROPIC_API_KEY=sk-ant-..."
    echo "  Option 2: cp backend/.env.example backend/.env && edit it"
    exit 1
  fi
fi

# Install backend deps if needed
if ! python3 -c "import fastapi" 2>/dev/null; then
  echo "Installing backend dependencies..."
  pip install -r "$SCRIPT_DIR/backend/requirements.txt" -q
fi

# Install frontend deps if needed
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$SCRIPT_DIR/frontend" && npm install -q
fi

# Start backend
echo "Starting backend on http://localhost:8000"
cd "$SCRIPT_DIR/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Start frontend
echo "Starting frontend on http://localhost:5173"
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Docs:     http://localhost:8000/docs"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop both servers."

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
