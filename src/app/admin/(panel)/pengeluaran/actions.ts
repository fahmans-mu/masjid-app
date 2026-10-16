"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories, expenses } from "@/lib/schema";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import {
  formDate,
  formInt,
  formString,
  type ActionState,
} from "@/lib/action-utils";

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/pengeluaran");
  revalidatePath("/laporan");
  revalidatePath("/transparansi");
  revalidatePath("/");
}

export async function saveExpenseAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireSession();

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
  const cat = db.select().from(categories).where(eq(categories.id, categoryId)).get();
  if (!cat || cat.kind !== "expense") {
    return { error: "Kategori pengeluaran tidak valid." };
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
    const existing = db.select().from(expenses).where(eq(expenses.id, id)).get();
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

  revalidateAll();
  redirect("/admin/pengeluaran");
}

export async function deleteExpenseAction(fd: FormData) {
  await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  db.delete(expenses).where(eq(expenses.id, id)).run();
  revalidateAll();
}
