"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  donations,
  mosques,
  programs,
  qurbanParticipants,
  qurbanPrograms,
} from "@/lib/schema";
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

  const mosqueId = formInt(fd, "mosqueId");
  if (!mosqueId) return { error: "Masjid tidak valid." };
  const mosque = db.select().from(mosques).where(eq(mosques.id, mosqueId)).get();
  if (!mosque || !mosque.isActive) return { error: "Masjid tidak ditemukan." };

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
    const p = db
      .select()
      .from(programs)
      .where(and(eq(programs.id, programId), eq(programs.mosqueId, mosqueId)))
      .get();
    if (!p) return { error: "Program donasi tidak ditemukan." };
  }
  if (categoryId) {
    const c = db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.mosqueId, mosqueId)))
      .get();
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
      mosqueId,
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

const QURBAN_SUCCESS =
  "Alhamdulillah, pendaftaran qurban sudah terkirim. Silakan hubungi bendahara masjid untuk informasi setoran berikutnya. Jazakumullahu khairan.";

export async function qurbanRegisterAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  if (formString(fd, "website")) {
    return { success: QURBAN_SUCCESS };
  }

  const mosqueId = formInt(fd, "mosqueId");
  const programId = formInt(fd, "programId");
  if (!mosqueId || !programId) return { error: "Data pendaftaran tidak valid." };

  const mosque = db.select().from(mosques).where(eq(mosques.id, mosqueId)).get();
  if (!mosque || !mosque.isActive) return { error: "Masjid tidak ditemukan." };

  const program = db
    .select()
    .from(qurbanPrograms)
    .where(
      and(eq(qurbanPrograms.id, programId), eq(qurbanPrograms.mosqueId, mosqueId))
    )
    .get();
  if (!program || !program.isActive) {
    return { error: "Program qurban sedang tidak dibuka." };
  }

  const name = formString(fd, "name").slice(0, 100);
  const phone = formOptional(fd, "phone")?.slice(0, 30) ?? null;
  const animalType = formString(fd, "animalType");
  const note = formOptional(fd, "note")?.slice(0, 500) ?? null;

  if (!name) return { error: "Nama peserta wajib diisi." };
  if (animalType !== "kambing" && animalType !== "sapi") {
    return { error: "Jenis hewan tidak valid." };
  }

  const targetAmount =
    animalType === "kambing" ? program.goatPrice : program.cowSharePrice;
  if (!targetAmount || targetAmount <= 0) {
    return { error: "Harga hewan belum diatur oleh masjid. Hubungi bendahara." };
  }

  db.insert(qurbanParticipants)
    .values({
      mosqueId,
      programId,
      name,
      phone,
      animalType,
      targetAmount,
      note,
      status: "pending",
    })
    .run();

  return { success: QURBAN_SUCCESS };
}
