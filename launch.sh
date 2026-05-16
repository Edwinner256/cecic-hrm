#!/bin/bash
# ─── HR Management System - Shell Launcher ───────────────────────
# Usage: ./launch.sh          (launches the built .app)
#        ./launch.sh dev      (launches via npm/electron for development)
#        ./launch.sh install  (copies .app to /Applications)

DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="HR Management System"

# Find the built app
APP_PATH=""
for candidate in "$DIR/dist/mac-arm64/$APP_NAME.app" "$DIR/dist/mac/$APP_NAME.app"; do
  if [ -d "$candidate" ]; then
    APP_PATH="$candidate"
    break
  fi
done

launch_dev() {
  echo "🚀 Launching $APP_NAME in development mode..."
  export PATH="/usr/local/bin:$PATH"
  cd "$DIR" && npx electron .
}

launch_app() {
  if [ -z "$APP_PATH" ]; then
    echo "❌ No built app found. Building now..."
    cd "$DIR" && npm run build:mac
    # Re-check
    for candidate in "$DIR/dist/mac-arm64/$APP_NAME.app" "$DIR/dist/mac/$APP_NAME.app"; do
      if [ -d "$candidate" ]; then
        APP_PATH="$candidate"
        break
      fi
    done
  fi

  if [ -n "$APP_PATH" ]; then
    echo "✅ Launching $APP_NAME..."
    open "$APP_PATH"
  else
    echo "❌ Build failed. Try './launch.sh dev' for development mode."
    exit 1
  fi
}

install_app() {
  if [ -z "$APP_PATH" ]; then
    echo "❌ No built app found. Run 'npm run build:mac' first."
    exit 1
  fi

  echo "📦 Installing $APP_NAME to /Applications..."
  cp -R "$APP_PATH" "/Applications/$APP_NAME.app"
  echo "✅ Installed! You can now launch $APP_NAME from your Applications folder."
}

launch_web() {
  echo "🌐 Starting web server..."
  echo "   Open http://localhost:3000 in any browser"
  echo "   Works on mobile devices on the same network!"
  echo ""
  cd "$DIR" && node server.js --open
}

case "${1:-}" in
  dev)
    launch_dev
    ;;
  web|serve|browser)
    launch_web
    ;;
  install)
    install_app
    ;;
  *)
    launch_app
    ;;
esac
