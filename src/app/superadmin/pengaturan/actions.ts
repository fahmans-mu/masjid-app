"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { platformSettings } from "@/lib/schema";
import { requireSuper } from "@/lib/auth";
import { formInt, formOptional, type ActionState } from "@/lib/action-utils";

export async function savePlatformSettingsAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireSuper();

  const monthlyAmount = formInt(fd, "monthlyAmount");
  const trialDays = formInt(fd, "trialDays");

  if (!monthlyAmount || monthlyAmount < 10000) {
    return { error: "Nominal infaq bulanan minimal Rp10.000." };
  }
  if (trialDays == null || trialDays < 0 || trialDays > 365) {
    return { error: "Masa uji coba harus antara 0–365 hari." };
  }

  const values = {
    monthlyAmount,
    trialDays,
    bankName: formOptional(fd, "bankName"),
    bankAccount: formOptional(fd, "bankAccount"),
    bankHolder: formOptional(fd, "bankHolder"),
    contactPhone: formOptional(fd, "contactPhone"),
    contactEmail: formOptional(fd, "contactEmail"),
    infaqNote: formOptional(fd, "infaqNote"),
    updatedAt: new Date(),
  };

  const existing = db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, 1))
    .get();

  if (existing) {
    db.update(platformSettings).set(values).where(eq(platformSettings.id, 1)).run();
  } else {
    db.insert(platformSettings).values({ id: 1, ...values }).run();
  }

  revalidatePath("/infaq");
  revalidatePath("/daftar");
  return { success: "Pengaturan platform disimpan." };
}
