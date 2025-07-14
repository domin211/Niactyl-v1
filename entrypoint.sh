#!/bin/bash
set -e
cd /mnt/server
if [ ! -d .git ]; then
  git clone "${REPO_URL}" .
else
  git fetch origin "${BRANCH:-main}"
  git reset --hard "origin/${BRANCH:-main}"
fi
npm install --omit=dev
npm run build >/dev/null 2>&1 || true
exec node server.js

