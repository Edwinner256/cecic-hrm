#!/usr/bin/env bash
# ─── CECIC HRMS — Start Script ────────────────────────────────────
# Launches the system in browser mode (recommended) or desktop app.
#
# Usage:
#   ./start.sh              # Start web server, open browser
#   ./start.sh --serve      # Start web server only (no auto-open)
#   ./start.sh --desktop    # Launch as Electron desktop app
#   ./start.sh --port 8080  # Custom port (browser mode)
# ──────────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     CECIC HRMS                              ║${NC}"
echo -e "${CYAN}║     Human Resource Management System        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Check Node.js is installed
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js is not installed.${NC}"
  echo "   Run ./setup.sh first, or install Node.js 20+ manually."
  echo "   https://nodejs.org/"
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}❌ Node.js $(node -v) is too old. Need v18 or later.${NC}"
  echo "   Run ./setup.sh to upgrade."
  exit 1
fi

# Check deps installed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  npm install
fi

# Parse arguments
MODE="serve"
PORT=""
OPEN="--open"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --desktop|--electron)
      MODE="desktop"
      shift
      ;;
    --serve)
      MODE="serve"
      OPEN=""
      shift
      ;;
    --port)
      PORT="--port $2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: ./start.sh [OPTION]"
      echo ""
      echo "Options:"
      echo "  --desktop    Launch as Electron desktop app"
      echo "  --serve      Start web server only (no auto-open)"
      echo "  --port NUM   Custom port for web server (default: 3000)"
      echo "  --help       Show this help"
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

case "$MODE" in
  desktop)
    echo -e "${GREEN}🚀 Launching desktop app...${NC}"
    echo ""
    npx electron .
    ;;
  serve)
    echo -e "${GREEN}🌐 Starting web server...${NC}"
    echo ""
    node server.js $PORT $OPEN
    ;;
esac
