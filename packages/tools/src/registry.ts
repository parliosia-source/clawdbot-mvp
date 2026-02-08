import { z } from "zod";
import { tool as aiTool } from "ai";

import { tool as createDocumentTool } from "../create_document";

export type User = {
  id: string;
  roles: string[];
  scopes: string[];
};

export type ToolPermissions = {
  auth: "required" | "optional" | "none";
  scopes?: string[];
  rolesAnyOf?: string[];
};

export type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
};

export type DocumentsRepo = {
  create(input: { title: string; content: string }): Promise<DocumentRecord>;
};

export type DbRepos = {
  documentsRepo: DocumentsRepo;
};

export type Telemetry = {
  getCorrelationId(): string;
  withTrace<T>(
    meta: { name: string; correlationId: string; userId?: string },
    fn: () => Promise<T>
  ): Promise<T>;
  traceLLMCall<T>(meta: { model: string }, fn: () => Promise<T>): Promise<T>;
  traceToolCall<T>(meta: { toolName: string }, fn: () => Promise<T>): Promise<T>;
};

export type ToolCtx = {
  user: User;
  db: DbRepos;
  telemetry: Telemetry;
  correlationId: string;
};

export type ToolCall = {
  name: string;
  args: unknown;
};

export type ToolDef<TInput extends z.ZodTypeAny, TResult> = {
  name: string;
  description: string;
  schema: TInput;
  permissions: ToolPermissions;
  run(ctx: ToolCtx, input: z.infer<TInput>): Promise<TResult>;
};

export const toolRegistry = new Map<string, ToolDef<z.ZodTypeAny, unknown>>([
  [createDocumentTool.name, createDocumentTool]
]);

export function listToolDefs() {
  return [...toolRegistry.values()];
}

type AiTool = ReturnType<typeof aiTool>;

export function toAiTools(params: { dispatch: (call: ToolCall) => Promise<unknown> }): Record<string, AiTool> {
  const tools: Record<string, AiTool> = {};

  for (const def of listToolDefs()) {
    tools[def.name] = aiTool({
      description: def.description,
      parameters: z.any(), // TODO: zod-to-json-schema(def.schema)
      execute: async (args: unknown) => params.dispatch({ name: def.name, args })
    });
  }

  return tools;
}
