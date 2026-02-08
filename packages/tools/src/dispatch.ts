import { assertToolPermission } from "@app/auth/permissions";
import type { ToolCall, ToolCtx } from "./registry";
import { toolRegistry } from "./registry";

export async function dispatchToolCall(ctx: ToolCtx, call: ToolCall): Promise<unknown> {
  const def = toolRegistry.get(call.name);
  if (!def) throw new Error(`Unknown tool: ${call.name}`);

  assertToolPermission(ctx.user, def.permissions);

  const input = def.schema.parse(call.args);

  return await ctx.telemetry.traceToolCall({ toolName: call.name }, async () => {
    return await def.run(ctx, input);
  });
}
