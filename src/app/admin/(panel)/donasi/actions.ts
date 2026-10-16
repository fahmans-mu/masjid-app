"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { donations } from "@/lib/schema";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import {
  formDate,
  formInt,
  formOptional,
  formString,
  type ActionState,
} from "@/lib/action-utils";

const METHODS = ["transfer", "qris", "cash", "other"] as const;
type Method = (typeof METHODS)[number];

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/donasi");
  revalidatePath("/program");
  revalidatePath("/laporan");
  revalidatePath("/transparansi");
  revalidatePath("/");
}

export async function verifyDonationAction(fd: FormData) {
  const session = await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  db.update(donations)
    .set({ status: "verified", verifiedBy: session.name, verifiedAt: new Date() })
    .where(eq(donations.id, id))
    .run();
  revalidateAll();
}

export async function rejectDonationAction(fd: FormData) {
  const session = await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  db.update(donations)
    .set({ status: "rejected", verifiedBy: session.name, verifiedAt: new Date() })
    .where(eq(donations.id, id))
    .run();
  revalidateAll();
}

export async function deleteDonationAction(fd: FormData) {
  await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  db.delete(donations).where(eq(donations.id, id)).run();
  revalidateAll();
}

export async function saveDonationAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireSession();

  const id = formInt(fd, "id");
  const donorName = formString(fd, "donorName").slice(0, 100) || "Hamba Allah";
  const donorPhone = formOptional(fd, "donorPhone")?.slice(0, 30) ?? null;
  const amount = formInt(fd, "amount");
  const donatedAt = formDate(fd, "donatedAt");
  const method = formString(fd, "method");
  const programId = formInt(fd, "programId");
  const categoryId = formInt(fd, "categoryId");
  const note = formOptional(fd, "note")?.slice(0, 500) ?? null;

  if (!amount || amount < 1000) {
    return { error: "Nominal minimal Rp1.000." };
  }
  if (!donatedAt) {
    return { error: "Tanggal donasi wajib diisi." };
  }
  if (!METHODS.includes(method as Method)) {
    return { error: "Metode donasi tidak valid." };
  }
  if (!programId && !categoryId) {
    return { error: "Pilih program donasi atau kategori pemasukan." };
  }

  const proofEntry = fd.get("proof");
  const proofFile =
    proofEntry instanceof File && proofEntry.size > 0 ? proofEntry : null;
  let uploaded: string | null = null;
  if (proofFile) {
    try {
      uploaded = await saveUpload(proofFile, "donasi");
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Gagal mengunggah bukti.",
      };
    }
  }

  if (id) {
    const existing = db.select().from(donations).where(eq(donations.id, id)).get();
    if (!existing) return { error: "Donasi tidak ditemukan." };
    db.update(donations)
      .set({
        donorName,
        donorPhone,
        amount,
        method: method as Method,
        donatedAt,
        programId: programId ?? null,
        categoryId: categoryId ?? null,
        note,
        proofUrl: uploaded ?? existing.proofUrl,
      })
      .where(eq(donations.id, id))
      .run();
  } else {
    db.insert(donations)
      .values({
        donorName,
        donorPhone,
        amount,
        method: method as Method,
        donatedAt,
        programId: programId ?? null,
        categoryId: categoryId ?? null,
        note,
        proofUrl: uploaded,
        status: "verified",
        verifiedBy: session.name,
        verifiedAt: new Date(),
      })
      .run();
  }

  revalidateAll();
  redirect("/admin/donasi");
}
