"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { mosques, users } from "@/lib/schema";
import { createSession } from "@/lib/auth";
import type { ActionState } from "@/lib/action-utils";

export async function startDemoAction(): Promise<ActionState> {
  const demoMosque = db
    .select()
    .from(mosques)
    .where(and(eq(mosques.isDemo, true), eq(mosques.isActive, true)))
    .get();
  if (!demoMosque) {
    return { error: "Demo sedang tidak tersedia. Silakan coba lagi nanti." };
  }

  const demoUser = db
    .select()
    .from(users)
    .where(and(eq(users.mosqueId, demoMosque.id), eq(users.role, "pengurus")))
    .get();
  if (!demoUser) {
    return { error: "Demo sedang tidak tersedia. Silakan coba lagi nanti." };
  }

  await createSession({
    id: demoUser.id,
    name: demoUser.name,
    email: demoUser.email,
    role: "pengurus",
    mosqueId: demoMosque.id,
  });

  redirect("/admin");
}
