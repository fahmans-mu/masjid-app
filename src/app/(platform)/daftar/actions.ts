"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { mosques, users } from "@/lib/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { createDefaultCategories } from "@/lib/defaults";
import { getPlatformSettings } from "@/lib/queries";
import {
  formOptional,
  formString,
  isEmail,
  type ActionState,
} from "@/lib/action-utils";
import { slugify } from "@/lib/format";

function uniqueSlug(base: string): string {
  const root = slugify(base) || "masjid";
  let candidate = root;
  let n = 2;
  while (db.select().from(mosques).where(eq(mosques.slug, candidate)).get()) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}

export async function registerMosqueAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  if (formString(fd, "website")) {
    return { error: "Pendaftaran tidak valid." };
  }

  const mosqueName = formString(fd, "mosqueName").slice(0, 120);
  const slugInput = formString(fd, "slug").slice(0, 80);
  const address = formOptional(fd, "address")?.slice(0, 300) ?? null;
  const mosquePhone = formOptional(fd, "mosquePhone")?.slice(0, 30) ?? null;
  const mosqueEmail = formOptional(fd, "mosqueEmail")?.slice(0, 120) ?? null;

  const adminName = formString(fd, "adminName").slice(0, 100);
  const adminEmail = formString(fd, "adminEmail").toLowerCase().slice(0, 120);
  const password = formString(fd, "password");
  const password2 = formString(fd, "password2");

  if (!mosqueName) return { error: "Nama masjid wajib diisi." };
  if (slugInput && !/^[a-z0-9-]+$/.test(slugInput)) {
    return { error: "URL halaman hanya boleh berisi huruf kecil, angka, dan tanda minus." };
  }
  if (mosqueEmail && !isEmail(mosqueEmail)) {
    return { error: "Email masjid tidak valid." };
  }
  if (!adminName) return { error: "Nama pengurus wajib diisi." };
  if (!isEmail(adminEmail)) return { error: "Email login tidak valid." };
  if (db.select().from(users).where(eq(users.email, adminEmail)).get()) {
    return { error: "Email ini sudah terdaftar. Gunakan email lain atau masuk." };
  }
  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }
  if (password !== password2) {
    return { error: "Ulangi password tidak sama." };
  }

  const slug = slugInput ? uniqueSlug(slugInput) : uniqueSlug(mosqueName);
  const platform = getPlatformSettings();
  const trialDays = platform?.trialDays ?? 30;
  const activeUntil = new Date(Date.now() + trialDays * 86_400_000);

  const mosque = db
    .insert(mosques)
    .values({
      slug,
      name: mosqueName,
      address,
      phone: mosquePhone,
      email: mosqueEmail,
      activeUntil,
    })
    .returning()
    .get();

  createDefaultCategories(mosque.id);

  const user = db
    .insert(users)
    .values({
      mosqueId: mosque.id,
      name: adminName,
      email: adminEmail,
      passwordHash: await hashPassword(password),
      role: "pengurus",
    })
    .returning()
    .get();

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: "pengurus",
    mosqueId: mosque.id,
  });

  redirect("/admin");
}
