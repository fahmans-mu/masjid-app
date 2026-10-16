"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appInfaqs, mosques } from "@/lib/schema";
import { requireSuper } from "@/lib/auth";
import { getMosqueById } from "@/lib/queries";
import { addCalendarMonths } from "@/lib/format";
import { formInt } from "@/lib/action-utils";

export async function verifyAppInfaqAction(fd: FormData) {
  const session = await requireSuper();
  const id = formInt(fd, "id");
  if (!id) return;

  const infaq = db.select().from(appInfaqs).where(eq(appInfaqs.id, id)).get();
  if (!infaq || infaq.status !== "pending") return;

  const mosque = getMosqueById(infaq.mosqueId);
  if (!mosque) return;

  const base =
    mosque.activeUntil && mosque.activeUntil.getTime() > Date.now()
      ? mosque.activeUntil
      : new Date();
  const periodEnd = addCalendarMonths(base, infaq.months);

  db.update(appInfaqs)
    .set({
      status: "verified",
      verifiedBy: session.name,
      verifiedAt: new Date(),
      periodStart: base,
      periodEnd,
    })
    .where(eq(appInfaqs.id, id))
    .run();

  // activeUntil null = tanpa batas; infaq dicatat tanpa menurunkan status
  if (mosque.activeUntil !== null) {
    db.update(mosques)
      .set({ activeUntil: periodEnd, updatedAt: new Date() })
      .where(eq(mosques.id, mosque.id))
      .run();
  }

  revalidatePath("/superadmin", "layout");
  revalidatePath("/admin/infaq");
  revalidatePath(`/m/${mosque.slug}`, "layout");
}

export async function rejectAppInfaqAction(fd: FormData) {
  const session = await requireSuper();
  const id = formInt(fd, "id");
  if (!id) return;

  const infaq = db.select().from(appInfaqs).where(eq(appInfaqs.id, id)).get();
  if (!infaq || infaq.status !== "pending") return;

  db.update(appInfaqs)
    .set({
      status: "rejected",
      verifiedBy: session.name,
      verifiedAt: new Date(),
    })
    .where(eq(appInfaqs.id, id))
    .run();

  revalidatePath("/superadmin", "layout");
  revalidatePath("/admin/infaq");
}
