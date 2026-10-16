"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { qurbanDeposits, qurbanParticipants, qurbanPrograms } from "@/lib/schema";
import { requireMosqueSession } from "@/lib/auth";
import {
  getMosqueById,
  getQurbanParticipantById,
  getQurbanProgramById,
} from "@/lib/queries";
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
  revalidatePath("/admin/qurban", "layout");
  revalidatePath(`/m/${mosqueSlug}`, "layout");
}

export async function saveQurbanProgramAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return { error: "Masjid tidak ditemukan." };

  const id = formInt(fd, "id");
  const title = formString(fd, "title");
  const description = formOptional(fd, "description");
  const goatPrice = formInt(fd, "goatPrice");
  const cowSharePrice = formInt(fd, "cowSharePrice");
  const targetDate = formDate(fd, "targetDate");
  const isActive = fd.get("isActive") === "on";

  if (title.length < 3) return { error: "Judul program minimal 3 karakter." };
  if (goatPrice != null && goatPrice < 100_000) {
    return { error: "Harga kambing minimal Rp100.000 (isi 0 untuk menutup jenis ini)." };
  }
  if (cowSharePrice != null && cowSharePrice < 100_000) {
    return { error: "Harga sapi 1/7 minimal Rp100.000 (isi 0 untuk menutup jenis ini)." };
  }
  if (!goatPrice && !cowSharePrice) {
    return { error: "Isi minimal satu harga hewan (kambing atau sapi)." };
  }

  const goat = goatPrice && goatPrice > 0 ? goatPrice : null;
  const cow = cowSharePrice && cowSharePrice > 0 ? cowSharePrice : null;

  if (id) {
    const existing = getQurbanProgramById(mosque.id, id);
    if (!existing) return { error: "Program qurban tidak ditemukan." };
    db.update(qurbanPrograms)
      .set({
        title,
        description,
        goatPrice: goat,
        cowSharePrice: cow,
        targetDate,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(qurbanPrograms.id, id))
      .run();
  } else {
    db.insert(qurbanPrograms)
      .values({
        mosqueId: mosque.id,
        title,
        description,
        goatPrice: goat,
        cowSharePrice: cow,
        targetDate,
        isActive,
      })
      .run();
  }

  revalidateAll(mosque.slug);
  redirect("/admin/qurban");
}

export async function toggleQurbanProgramAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const id = formInt(fd, "id");
  if (!id) return;
  const existing = getQurbanProgramById(mosque.id, id);
  if (!existing) return;
  db.update(qurbanPrograms)
    .set({ isActive: !existing.isActive, updatedAt: new Date() })
    .where(eq(qurbanPrograms.id, id))
    .run();
  revalidateAll(mosque.slug);
}

export async function approveQurbanParticipantAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const id = formInt(fd, "id");
  if (!id) return;
  const p = getQurbanParticipantById(mosque.id, id);
  if (!p) return;
  db.update(qurbanParticipants)
    .set({ status: "approved", approvedAt: new Date() })
    .where(eq(qurbanParticipants.id, id))
    .run();
  revalidateAll(mosque.slug);
}

export async function rejectQurbanParticipantAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const id = formInt(fd, "id");
  if (!id) return;
  const p = getQurbanParticipantById(mosque.id, id);
  if (!p) return;
  db.update(qurbanParticipants)
    .set({ status: "rejected", approvedAt: null })
    .where(eq(qurbanParticipants.id, id))
    .run();
  revalidateAll(mosque.slug);
}

export async function addQurbanDepositAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return { error: "Masjid tidak ditemukan." };

  const participantId = formInt(fd, "participantId");
  const amount = formInt(fd, "amount");
  const method = formString(fd, "method");
  const depositedAt = formDate(fd, "depositedAt");
  const note = formOptional(fd, "note")?.slice(0, 500) ?? null;

  if (!participantId) return { error: "Peserta tidak valid." };
  const participant = getQurbanParticipantById(mosque.id, participantId);
  if (!participant) return { error: "Peserta tidak ditemukan." };

  if (!amount || amount < 1000) return { error: "Nominal setoran minimal Rp1.000." };
  if (!depositedAt) return { error: "Tanggal setoran wajib diisi." };
  if (!METHODS.includes(method as Method)) {
    return { error: "Metode setoran tidak valid." };
  }

  const proofEntry = fd.get("proof");
  const proofFile =
    proofEntry instanceof File && proofEntry.size > 0 ? proofEntry : null;
  let uploaded: string | null = null;
  if (proofFile) {
    try {
      uploaded = await saveUpload(proofFile, "qurban");
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Gagal mengunggah bukti setoran.",
      };
    }
  }

  db.insert(qurbanDeposits)
    .values({
      mosqueId: mosque.id,
      participantId,
      amount,
      method: method as Method,
      depositedAt,
      note,
      proofUrl: uploaded,
      recordedBy: session.name,
    })
    .run();

  revalidateAll(mosque.slug);
  return { success: "Setoran berhasil dicatat." };
}

export async function deleteQurbanDepositAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const id = formInt(fd, "id");
  if (!id) return;
  db.delete(qurbanDeposits)
    .where(and(eq(qurbanDeposits.id, id), eq(qurbanDeposits.mosqueId, mosque.id)))
    .run();
  revalidateAll(mosque.slug);
}
