import type { ToolPermissions, User } from "@app/tools/registry";

function hasAnyRole(user: User, rolesAnyOf: string[]): boolean {
  return rolesAnyOf.some((r) => user.roles.includes(r));
}

function hasAllScopes(user: User, scopes: string[]): boolean {
  return scopes.every((s) => user.scopes.includes(s));
}

export function assertToolPermission(user: User | null, perms: ToolPermissions): void {
  if (perms.auth === "none") return;
  if (!user) throw new Error("UNAUTHENTICATED");

  if (perms.rolesAnyOf?.length) {
    if (!hasAnyRole(user, perms.rolesAnyOf)) throw new Error("FORBIDDEN");
  }

  if (perms.scopes?.length) {
    if (!hasAllScopes(user, perms.scopes)) throw new Error("FORBIDDEN");
  }
}
