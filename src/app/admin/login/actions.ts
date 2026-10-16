"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { formString, type ActionState } from "@/lib/action-utils";

export async function loginAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const email = formString(fd, "email").toLowerCase();
  const password = formString(fd, "password");
  const next = formString(fd, "next");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !user.isActive) {
    return { error: "Email atau password salah." };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Email atau password salah." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mosqueId: user.mosqueId,
  });

  if (user.role === "super") {
    redirect(next.startsWith("/superadmin") ? next : "/superadmin");
  }
  redirect(next.startsWith("/admin") ? next : "/admin");
}
