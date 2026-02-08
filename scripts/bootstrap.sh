#!/usr/bin/env bash
set -euo pipefail

echo "Repo already contains all files."
echo "Run:"
echo "  cp .env.example .env.local"
echo "  # edit .env.local and set OPENAI_API_KEY"
echo "  pnpm i"
echo "  pnpm dev"
echo "  node ./scripts/smoke-chat.mjs"
