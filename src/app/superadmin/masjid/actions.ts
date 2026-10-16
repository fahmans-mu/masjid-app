"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { mosques } from "@/lib/schema";
import { requireSuper } from "@/lib/auth";
import { getMosqueById } from "@/lib/queries";
import { addCalendarMonths } from "@/lib/format";
import { formInt } from "@/lib/action-utils";

function revalidateMosque(mosqueId: number) {
  const mosque = getMosqueById(mosqueId);
  revalidatePath("/superadmin", "layout");
  if (mosque) {
    revalidatePath(`/m/${mosque.slug}`, "layout");
    revalidatePath("/admin/infaq");
    revalidatePath("/masjid");
  }
}

export async function toggleMosqueActiveAction(fd: FormData) {
  await requireSuper();
  const id = formInt(fd, "id");
  if (!id) return;
  const existing = getMosqueById(id);
  if (!existing) return;
  db.update(mosques)
    .set({ isActive: !existing.isActive, updatedAt: new Date() })
    .where(eq(mosques.id, id))
    .run();
  revalidateMosque(id);
}

export async function extendMosqueAction(fd: FormData) {
  await requireSuper();
  const id = formInt(fd, "id");
  const months = formInt(fd, "months");
  if (!id || !months || ![1, 6, 12].includes(months)) return;
  const mosque = getMosqueById(id);
  if (!mosque) return;

  const base =
    mosque.activeUntil && mosque.activeUntil.getTime() > Date.now()
      ? mosque.activeUntil
      : new Date();
  const newUntil = addCalendarMonths(base, months);
  db.update(mosques)
    .set({ activeUntil: newUntil, updatedAt: new Date() })
    .where(eq(mosques.id, id))
    .run();
  revalidateMosque(id);
}

export async function setMosqueUnlimitedAction(fd: FormData) {
  await requireSuper();
  const id = formInt(fd, "id");
  if (!id) return;
  const mosque = getMosqueById(id);
  if (!mosque) return;
  db.update(mosques)
    .set({ activeUntil: null, updatedAt: new Date() })
    .where(eq(mosques.id, id))
    .run();
  revalidateMosque(id);
}
