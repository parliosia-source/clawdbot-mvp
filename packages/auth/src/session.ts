import type { User } from "@app/tools/registry";

export type Session = {
  user: User | null;
};

export async function getSession(_req: Request): Promise<Session> {
  return {
    user: {
      id: "dev-user",
      roles: ["admin"],
      scopes: ["documents:write"]
    }
  };
}

export async function requireUser(req: Request): Promise<User> {
  const session = await getSession(req);
  if (!session.user) throw new Error("UNAUTHENTICATED");
  return session.user;
}
