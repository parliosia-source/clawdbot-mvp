import { z } from "zod";
import type { ToolDef } from "../src/registry";

const schema = z.object({
  title: z.string().min(1),
  content: z.string().default("")
});

type Result = { id: string; title: string };

export const tool: ToolDef<typeof schema, Result> = {
  name: "create_document",
  description: "Create a document and persist it (MVP: in-memory repo).",
  schema,
  permissions: {
    auth: "required",
    scopes: ["documents:write"],
    rolesAnyOf: ["user", "admin"]
  },
  async run(ctx, input) {
    const doc = await ctx.db.documentsRepo.create({
      title: input.title,
      content: input.content
    });
    return { id: doc.id, title: doc.title };
  }
};
