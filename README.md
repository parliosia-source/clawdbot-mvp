# clawdbot-mvp

Monorepo MVP (pnpm + Turborepo + Next.js) with:
- `/api/chat` streaming via Vercel AI SDK (`streamText`)
- Tool-calling (`create_document`) with Zod validation
- Auth stub + telemetry wrapper (Langfuse-ready)

## Run

```bash
cp .env.example .env.local
# edit .env.local and set OPENAI_API_KEY
pnpm i
pnpm dev
# in another terminal:
node ./scripts/smoke-chat.mjs
```

## Notes
- Secrets: never commit `.env.local`.
- Tools expose `parameters: z.any()` for MVP (TODO: zod-to-json-schema).
