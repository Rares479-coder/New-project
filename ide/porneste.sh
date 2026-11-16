#!/bin/bash
# Porneste IDE-ul C/C++ (Linux / macOS)
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then
  echo "Nu am găsit Node.js. Instalează-l de pe https://nodejs.org (versiunea LTS)."; exit 1
fi
if ! command -v g++ >/dev/null; then
  echo "Atenție: nu am găsit g++. Instalează un compilator (vezi ide/README.md)."
fi
[ -d node_modules ] || npm install
URL="http://localhost:${PORT:-3000}"
( sleep 1.5; (xdg-open "$URL" || open "$URL") >/dev/null 2>&1 ) &
node server.js "$@"
