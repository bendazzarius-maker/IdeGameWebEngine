#!/usr/bin/env bash
# start_server.sh — helper to reinstall dependencies and run Vite.
# Matches the manual workflow: remove existing modules, reinstall, start dev server.

cd "$(dirname "$0")" || exit 1

rm -rf node_modules package-lock.json
npm install
npm run dev
