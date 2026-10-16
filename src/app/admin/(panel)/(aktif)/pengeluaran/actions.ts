"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories, expenses, programs } from "@/lib/schema";
import { requireMosqueSession } from "@/lib/auth";
import { getMosqueById } from "@/lib/queries";
import { saveUpload } from "@/lib/upload";
import {
  formDate,
  formInt,
  formString,
  type ActionState,
} from "@/lib/action-utils";

function revalidateAll(mosqueSlug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/pengeluaran");
  revalidatePath(`/m/${mosqueSlug}`, "layout");
}

export async function saveExpenseAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return { error: "Masjid tidak ditemukan." };

  const id = formInt(fd, "id");
  const description = formString(fd, "description");
  const amount = formInt(fd, "amount");
  const spentAt = formDate(fd, "spentAt");
  const categoryId = formInt(fd, "categoryId");
  const programId = formInt(fd, "programId");

  if (description.length < 3) {
    return { error: "Keterangan pengeluaran minimal 3 karakter." };
  }
  if (!amount || amount < 1000) {
    return { error: "Nominal minimal Rp1.000." };
  }
  if (!spentAt) {
    return { error: "Tanggal pengeluaran wajib diisi." };
  }
  if (!categoryId) {
    return { error: "Kategori pengeluaran wajib dipilih." };
  }
  const cat = db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.mosqueId, mosque.id)))
    .get();
  if (!cat || cat.kind !== "expense") {
    return { error: "Kategori pengeluaran tidak valid." };
  }
  if (programId) {
    const p = db
      .select()
      .from(programs)
      .where(and(eq(programs.id, programId), eq(programs.mosqueId, mosque.id)))
      .get();
    if (!p) return { error: "Program tidak ditemukan." };
  }

  const receiptEntry = fd.get("receipt");
  const receiptFile =
    receiptEntry instanceof File && receiptEntry.size > 0 ? receiptEntry : null;
  let uploaded: string | null = null;
  if (receiptFile) {
    try {
      uploaded = await saveUpload(receiptFile, "nota");
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Gagal mengunggah nota.",
      };
    }
  }

  if (id) {
    const existing = db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.mosqueId, mosque.id)))
      .get();
    if (!existing) return { error: "Pengeluaran tidak ditemukan." };
    db.update(expenses)
      .set({
        description,
        amount,
        spentAt,
        categoryId,
        programId: programId ?? null,
        receiptUrl: uploaded ?? existing.receiptUrl,
      })
      .where(eq(expenses.id, id))
      .run();
  } else {
    db.insert(expenses)
      .values({
        mosqueId: mosque.id,
        description,
        amount,
        spentAt,
        categoryId,
        programId: programId ?? null,
        receiptUrl: uploaded,
        createdBy: session.name,
      })
      .run();
  }

  revalidateAll(mosque.slug);
  redirect("/admin/pengeluaran");
}

export async function deleteExpenseAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const id = formInt(fd, "id");
  if (!id) return;
  db.delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.mosqueId, mosque.id)))
    .run();
  revalidateAll(mosque.slug);
}
