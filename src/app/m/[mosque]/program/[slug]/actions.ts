"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { mayarPayments, mosques, programs } from "@/lib/schema";
import {
  formInt,
  formOptional,
  formString,
  isEmail,
  type ActionState,
} from "@/lib/action-utils";
import { createMayarPayment } from "@/lib/mayar";
import { getAppBaseUrl } from "@/lib/app-url";

export async function createMayarDonationAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const mosqueId = formInt(fd, "mosqueId");
  const programId = formInt(fd, "programId");
  if (!mosqueId || !programId) return { error: "Data donasi tidak valid." };

  const mosque = db.select().from(mosques).where(eq(mosques.id, mosqueId)).get();
  if (!mosque || !mosque.isActive) return { error: "Masjid tidak ditemukan." };
  if (!mosque.mayarEnabled || !mosque.mayarApiKey) {
    return { error: "Pembayaran online belum diaktifkan oleh pengurus masjid." };
  }

  const program = db
    .select()
    .from(programs)
    .where(and(eq(programs.id, programId), eq(programs.mosqueId, mosqueId)))
    .get();
  if (!program || !program.isActive) {
    return { error: "Program donasi tidak ditemukan atau sudah selesai." };
  }

  const amount = formInt(fd, "amount");
  if (!amount || amount < 1000) {
    return { error: "Nominal donasi minimal Rp1.000." };
  }
  if (amount > 1_000_000_000) {
    return { error: "Nominal terlalu besar. Silakan hubungi sekretariat masjid." };
  }

  const donorName = formString(fd, "donorName").slice(0, 100) || "Hamba Allah";
  const rawPhone = formString(fd, "phone").replace(/[^\d+]/g, "");
  if (rawPhone.replace(/\D/g, "").length < 9) {
    return { error: "Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx." };
  }
  const donorPhone = rawPhone.slice(0, 30);
  const email = formOptional(fd, "email")?.slice(0, 120) ?? null;
  if (email && !isEmail(email)) {
    return { error: "Format email tidak valid." };
  }

  const base = await getAppBaseUrl();
  let invoice;
  try {
    invoice = await createMayarPayment(mosque.mayarApiKey, {
      name: donorName,
      email,
      mobile: donorPhone,
      amount,
      description: `Donasi ${program.title} — ${mosque.name}`,
      redirectUrl: `${base}/m/${mosque.slug}/program/${program.slug}?bayar=selesai`,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      extraData: { mosqueId, programId },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal membuat tagihan Mayar." };
  }

  if (!invoice?.id || !invoice.link) {
    return { error: "Mayar tidak mengembalikan link pembayaran. Coba lagi." };
  }

  db.insert(mayarPayments)
    .values({
      mosqueId,
      programId,
      invoiceId: invoice.id,
      transactionId: invoice.transactionId ?? null,
      link: invoice.link,
      amount,
      donorName,
      donorEmail: email,
      donorPhone,
      status: "pending",
    })
    .run();

  redirect(invoice.link);
}