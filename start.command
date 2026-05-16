#!/bin/bash
# ─── HR Management System - macOS Launcher ───────────────────────
# Double-click this file in Finder to launch the app.
# If Terminal opens, the app will start. Close Terminal to quit.

DIR="$(cd "$(dirname "$0")" && pwd)"

# Priority 1: Launch the standalone .app if built
if [ -d "$DIR/dist/mac-arm64/HR Management System.app" ]; then
  open "$DIR/dist/mac-arm64/HR Management System.app"
  exit 0
fi

if [ -d "$DIR/dist/mac/HR Management System.app" ]; then
  open "$DIR/dist/mac/HR Management System.app"
  exit 0
fi

# Priority 2: Launch via npm/electron (dev mode)
if command -v npx &> /dev/null; then
  export PATH="/usr/local/bin:$PATH"
  echo "Launching HRMS in development mode..."
  cd "$DIR" && npx electron .
  exit $?
fi

# If nothing works
echo "Error: Could not find HR Management System app."
echo "Run 'npm install' then 'npm start' from the project directory."
echo ""
echo "Or build a standalone app with 'npm run build:mac'"
exit 1
