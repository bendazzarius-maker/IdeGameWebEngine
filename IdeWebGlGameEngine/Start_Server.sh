#!/usr/bin/env bash
# start_server.sh — simple wrapper around the Vite dev server.
# Uses npm + Vite to serve the project with Vue support.

PORT="${PORT:-5173}"

cd "$(dirname "$0")" || exit 1

# Install dependencies if missing
if [ ! -d node_modules ]; then
  npm install
fi

# Forward custom port to Vite
npm run dev -- --port "$PORT"
