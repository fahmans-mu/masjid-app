"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, donations, programs } from "@/lib/schema";
import { saveUpload } from "@/lib/upload";
import {
  formDate,
  formInt,
  formOptional,
  formString,
  type ActionState,
} from "@/lib/action-utils";
import { todayISO } from "@/lib/format";

const METHODS = ["transfer", "qris", "cash", "other"];

const SUCCESS_MESSAGE =
  "Alhamdulillah, konfirmasi donasi sudah terkirim. Bendahara akan memverifikasi maksimal 1×24 jam, dan donasi akan tampil di halaman ini setelah terverifikasi. Jazakumullahu khairan.";

export async function confirmDonationAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  // honeypot — bot mengisi field tersembunyi ini
  if (formString(fd, "website")) {
    return { success: SUCCESS_MESSAGE };
  }

  const donorName = formString(fd, "donorName").slice(0, 100) || "Hamba Allah";
  const donorPhone = formOptional(fd, "donorPhone")?.slice(0, 30) ?? null;
  const amount = formInt(fd, "amount");
  const donatedAt = formDate(fd, "donatedAt") ?? todayISO();
  const method = formString(fd, "method");
  const programId = formInt(fd, "programId");
  const categoryId = formInt(fd, "categoryId");
  const note = formOptional(fd, "note")?.slice(0, 500) ?? null;

  if (!amount || amount < 1000) {
    return { error: "Nominal donasi minimal Rp1.000." };
  }
  if (amount > 1_000_000_000) {
    return { error: "Nominal terlalu besar. Silakan hubungi sekretariat masjid langsung." };
  }
  if (!METHODS.includes(method)) {
    return { error: "Metode donasi tidak valid." };
  }
  if (!programId && !categoryId) {
    return { error: "Pilih program donasi, atau kategori untuk donasi umum." };
  }

  if (programId) {
    const p = db.select().from(programs).where(eq(programs.id, programId)).get();
    if (!p) return { error: "Program donasi tidak ditemukan." };
  }
  if (categoryId) {
    const c = db.select().from(categories).where(eq(categories.id, categoryId)).get();
    if (!c || c.kind !== "income") {
      return { error: "Kategori donasi tidak ditemukan." };
    }
  }

  let proofUrl: string | null = null;
  const proofEntry = fd.get("proof");
  const proofFile = proofEntry instanceof File && proofEntry.size > 0 ? proofEntry : null;
  try {
    proofUrl = await saveUpload(proofFile, "donasi");
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Gagal mengunggah bukti transfer.",
    };
  }

  db.insert(donations)
    .values({
      programId: programId ?? null,
      categoryId: categoryId ?? null,
      donorName,
      donorPhone,
      amount,
      method: method as "transfer" | "qris" | "cash" | "other",
      donatedAt,
      note,
      proofUrl,
      status: "pending",
    })
    .run();

  return { success: SUCCESS_MESSAGE };
}
