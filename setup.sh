#!/usr/bin/env bash
# ─── CECIC HRMS — Linux / Ubuntu Setup ────────────────────────────
# One-command setup: installs Node.js, system deps, and project deps.
#
# Usage:
#   chmod +x setup.sh && ./setup.sh
#
# Supported: Ubuntu, Debian, Linux Mint, Pop!_OS, and most Debian-based distros.
# For Arch/Fedora, install Node.js 20+ manually, then run: npm install
# ──────────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     CECIC HRMS — Setup Script               ║${NC}"
echo -e "${CYAN}║     Linux / Ubuntu Edition                   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ─── 1. Check/Install Node.js ────────────────────────────────────

install_nodejs() {
  echo -e "${YELLOW}🔧 Installing Node.js 20.x (LTS)...${NC}"

  # Use NodeSource for Ubuntu/Debian
  if command -v apt-get &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y nodejs
  elif command -v pacman &>/dev/null; then
    sudo pacman -S --noconfirm nodejs npm
  else
    echo -e "${RED}❌ Unsupported package manager. Please install Node.js 20+ manually.${NC}"
    echo "   https://nodejs.org/"
    exit 1
  fi
}

if command -v node &>/dev/null; then
  NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VER" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js v$(node -v) is too old. Installing v20 LTS...${NC}"
    install_nodejs
  else
    echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
  fi
else
  echo -e "${YELLOW}🔧 Node.js not found. Installing...${NC}"
  install_nodejs
fi

# ─── 2. System Libraries for Electron (optional) ──────────────────
# Only needed if running as a desktop app (npm start / npm run build:linux)

install_electron_deps() {
  echo -e "${YELLOW}🔧 Installing Electron system dependencies...${NC}"

  if command -v apt-get &>/dev/null; then
    sudo apt-get install -y \
      libnss3 \
      libatk-bridge2.0-0 \
      libxkbcommon0 \
      libxdamage1 \
      libgbm1 \
      libpango-1.0-0 \
      libcairo2 \
      libasound2 \
      libgtk-3-0 \
      libdrm2 \
      libxshmfence1 \
      2>/dev/null || true
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y nss atk bridge-utils xkbcommon libxdamage libgbm pango cairo alsa-lib gtk3 libdrm || true
  fi
}

echo ""
echo -e "${YELLOW}📦 Installing Electron system libraries (for desktop app)...${NC}"
install_electron_deps

# ─── 3. Install Project Dependencies ──────────────────────────────

echo ""
echo -e "${YELLOW}📦 Installing project dependencies (npm install)...${NC}"
npm install

# ─── 4. Success ───────────────────────────────────────────────────

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup Complete!                         ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Run the system with:                       ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  📱 Browser mode (recommended):              ║${NC}"
echo -e "${GREEN}║     ./start.sh                               ║${NC}"
echo -e "${GREEN}║     npm run serve                            ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  🖥️  Desktop app (needs display):             ║${NC}"
echo -e "${GREEN}║     npm start                                ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  📦 Build Linux installer:                    ║${NC}"
echo -e "${GREEN}║     npm run build:linux                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🌐 Login: http://localhost:3000${NC}"
echo -e "${CYAN}👤 Username: admin | Password: admin123${NC}"
echo ""
