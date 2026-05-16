#!/bin/bash
# ─── HR Management System — Quick Start ──────────────────────────
# Double-click this file to start the app.
# Choose: Web Browser (recommended) or Desktop App.

DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="/usr/local/bin:$PATH"

clear
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   HR Management System                      ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  1. 🌐  Open in Web Browser (recommended)   ║"
echo "║  2. 🖥   Launch Desktop App                  ║"
echo "║  3. ❌  Quit                                 ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo -n "Choose [1-3]: "
read choice

case "$choice" in
  1)
    echo ""
    echo "Starting web server..."
    cd "$DIR" && node server.js --open
    ;;
  2)
    echo ""
    # Check if built app exists
    if [ -d "$DIR/dist/mac/HR Management System.app" ]; then
      echo "Launching Desktop App..."
      open "$DIR/dist/mac/HR Management System.app"
    elif [ -d "$DIR/dist/mac-arm64/HR Management System.app" ]; then
      echo "Launching Desktop App (Apple Silicon)..."
      open "$DIR/dist/mac-arm64/HR Management System.app"
    else
      echo "No built app found. Launching in development mode..."
      cd "$DIR" && npx electron .
    fi
    echo ""
    echo "✅ App launched! You can close this window."
    ;;
  *)
    echo "Goodbye!"
    exit 0
    ;;
esac
