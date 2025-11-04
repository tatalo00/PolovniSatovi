import "server-only";

import { auth } from "@/auth";
import { UserRole } from "@/lib/generated/prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if ((user as any).role !== role) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireSeller() {
  return requireRole("SELLER");
}

