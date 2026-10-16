"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories, donations, programs } from "@/lib/schema";
import { requireMosqueSession } from "@/lib/auth";
import { getMosqueById } from "@/lib/queries";
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

function revalidateAll(mosqueSlug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/donasi");
  revalidatePath(`/m/${mosqueSlug}`, "layout");
}

export async function verifyDonationAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const id = formInt(fd, "id");
  if (!id) return;
  db.update(donations)
    .set({ status: "verified", verifiedBy: session.name, verifiedAt: new Date() })
    .where(and(eq(donations.id, id), eq(donations.mosqueId, mosque.id)))
    .run();
  revalidateAll(mosque.slug);
}

export async function rejectDonationAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const id = formInt(fd, "id");
  if (!id) return;
  db.update(donations)
    .set({ status: "rejected", verifiedBy: session.name, verifiedAt: new Date() })
    .where(and(eq(donations.id, id), eq(donations.mosqueId, mosque.id)))
    .run();
  revalidateAll(mosque.slug);
}

export async function deleteDonationAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const id = formInt(fd, "id");
  if (!id) return;
  db.delete(donations)
    .where(and(eq(donations.id, id), eq(donations.mosqueId, mosque.id)))
    .run();
  revalidateAll(mosque.slug);
}

export async function saveDonationAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return { error: "Masjid tidak ditemukan." };

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

  if (programId) {
    const p = db
      .select()
      .from(programs)
      .where(and(eq(programs.id, programId), eq(programs.mosqueId, mosque.id)))
      .get();
    if (!p) return { error: "Program donasi tidak ditemukan." };
  }
  if (categoryId) {
    const c = db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.mosqueId, mosque.id)))
      .get();
    if (!c || c.kind !== "income") {
      return { error: "Kategori pemasukan tidak ditemukan." };
    }
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
    const existing = db
      .select()
      .from(donations)
      .where(and(eq(donations.id, id), eq(donations.mosqueId, mosque.id)))
      .get();
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
        mosqueId: mosque.id,
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

  revalidateAll(mosque.slug);
  redirect("/admin/donasi");
}
