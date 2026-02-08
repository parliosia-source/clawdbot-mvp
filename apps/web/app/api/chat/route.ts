import { randomUUID } from "node:crypto";
import { streamText, type CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { requireUser } from "@app/auth/session";
import { telemetry } from "@app/telemetry";
import { dispatchToolCall } from "@app/tools/dispatch";
import { toAiTools, type DbRepos, type DocumentRecord, type ToolCtx } from "@app/tools/registry";

export const runtime = "nodejs";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const CHAT_MAX_DURATION = envInt("CHAT_MAX_DURATION", 60);
const CHAT_MAX_STEPS = envInt("CHAT_MAX_STEPS", 5);

export const maxDuration = CHAT_MAX_DURATION;

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })
  )
});

function missingKeyResponse() {
  return new Response("Missing OPENAI_API_KEY (set .env.local)", {
    status: 500,
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}

function makeInMemoryDb(): DbRepos {
  const docs = new Map<string, DocumentRecord>();

  return {
    documentsRepo: {
      async create(input) {
        const rec: DocumentRecord = {
          id: randomUUID(),
          title: input.title,
          content: input.content,
          createdAt: new Date()
        };
        docs.set(rec.id, rec);
        return rec;
      }
    }
  };
}

function toCoreMessages(
  input: Array<{ role: "system" | "user" | "assistant"; content: string }>
): CoreMessage[] {
  return input.map((m) => ({ role: m.role, content: m.content }));
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return missingKeyResponse();
  }

  const user = await requireUser(req);
  const correlationId = telemetry.getCorrelationId();
  const db = makeInMemoryDb();

  const ctx: ToolCtx = {
    user,
    db,
    telemetry,
    correlationId
  };

  const json = await req.json();
  const body = bodySchema.parse(json);

  const systemInstruction: CoreMessage = {
    role: "system",
    content: [
      "You are an assistant with access to tools.",
      "If the user requests an action that matches a tool (e.g., creating a document), call the appropriate tool instead of describing what you would do.",
      "If you did NOT execute the action via a tool, reply exactly with:",
      "“Je n’ai pas pu exécuter l’action, reformule en demandant explicitement d’utiliser le tool create_document avec un Title et un Content.”"
    ].join("\n")
  };

  const aiTools = toAiTools({
    dispatch: (call) => dispatchToolCall(ctx, call)
  });

  return await telemetry.withTrace(
    { name: "chat_request", correlationId, userId: user.id },
    async () => {
      const result = await telemetry.traceLLMCall({ model: "openai:gpt-4o-mini" }, async () => {
        return streamText({
          model: openai("gpt-4o-mini"),
          messages: [systemInstruction, ...toCoreMessages(body.messages)],
          tools: aiTools,
          maxSteps: CHAT_MAX_STEPS
        });
      });

      return result.toTextStreamResponse();
    }
  );
}
