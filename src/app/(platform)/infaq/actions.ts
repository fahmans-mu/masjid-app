"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appInfaqs, mosques } from "@/lib/schema";
import { saveUpload } from "@/lib/upload";
import { getPlatformSettings } from "@/lib/queries";
import {
  formInt,
  formOptional,
  formString,
  type ActionState,
} from "@/lib/action-utils";

const METHODS = ["transfer", "qris", "cash", "other"];

const SUCCESS_MESSAGE =
  "Alhamdulillah, konfirmasi infaq sudah terkirim. Tim MasjidAmanah akan memverifikasi maksimal 1×24 jam, dan masa aktif masjid Anda otomatis diperpanjang setelah terverifikasi. Jazakumullahu khairan.";

export async function submitAppInfaqAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  if (formString(fd, "website")) {
    return { success: SUCCESS_MESSAGE };
  }

  const mosqueId = formInt(fd, "mosqueId");
  const months = formInt(fd, "months");
  const senderName = formString(fd, "senderName").slice(0, 100);
  const method = formString(fd, "method");
  const note = formOptional(fd, "note")?.slice(0, 500) ?? null;

  if (!mosqueId) return { error: "Pilih masjid yang ingin diperpanjang." };
  if (months !== 1 && months !== 6 && months !== 12) {
    return { error: "Pilihan durasi tidak valid." };
  }
  if (!senderName) return { error: "Nama pengirim wajib diisi." };
  if (!METHODS.includes(method)) return { error: "Metode pembayaran tidak valid." };

  const mosque = db
    .select()
    .from(mosques)
    .where(and(eq(mosques.id, mosqueId), eq(mosques.isDemo, false)))
    .get();
  if (!mosque) return { error: "Masjid tidak ditemukan." };
  if (!mosque.isActive) {
    return { error: "Masjid ini sedang nonaktif. Hubungi tim MasjidAmanah." };
  }

  const platform = getPlatformSettings();
  const monthlyAmount = platform?.monthlyAmount ?? 50000;
  const amount = monthlyAmount * months;

  let proofUrl: string | null = null;
  const proofEntry = fd.get("proof");
  const proofFile = proofEntry instanceof File && proofEntry.size > 0 ? proofEntry : null;
  try {
    proofUrl = await saveUpload(proofFile, "infaq");
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Gagal mengunggah bukti pembayaran.",
    };
  }

  if (!proofUrl) {
    return { error: "Bukti pembayaran wajib diunggah (screenshot/foto transfer)." };
  }

  db.insert(appInfaqs)
    .values({
      mosqueId: mosque.id,
      months: months as 1 | 6 | 12,
      monthlyAmount,
      amount,
      senderName,
      method: method as "transfer" | "qris" | "cash" | "other",
      note,
      proofUrl,
      status: "pending",
    })
    .run();

  return { success: SUCCESS_MESSAGE };
}
