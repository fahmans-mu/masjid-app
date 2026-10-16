"use server";

import { and, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories, settings, users } from "@/lib/schema";
import { hashPassword, requireSession, verifyPassword } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import {
  formInt,
  formOptional,
  formString,
  isEmail,
  type ActionState,
} from "@/lib/action-utils";
import { countCategoryUsage, getSettings } from "@/lib/queries";

function revalidateAll() {
  revalidatePath("/admin/pengaturan");
  revalidatePath("/", "layout");
}

async function upsertSettings(values: Partial<typeof settings.$inferInsert>) {
  const s = getSettings();
  if (s) {
    db.update(settings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(settings.id, 1))
      .run();
  } else {
    db.insert(settings).values({ id: 1, ...values }).run();
  }
}

export async function saveMosqueProfileAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireSession();

  const mosqueName = formString(fd, "mosqueName");
  const tagline = formOptional(fd, "tagline");
  const address = formOptional(fd, "address");
  const phone = formOptional(fd, "phone");
  const email = formOptional(fd, "email");

  if (mosqueName.length < 2) {
    return { error: "Nama masjid minimal 2 karakter." };
  }
  if (email && !isEmail(email)) {
    return { error: "Format email tidak valid." };
  }

  const logoEntry = fd.get("logo");
  const logoFile = logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;
  let logoUrl: string | null = null;
  if (logoFile) {
    try {
      logoUrl = await saveUpload(logoFile, "logo");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Gagal mengunggah logo." };
    }
  }

  await upsertSettings({
    mosqueName,
    tagline,
    address,
    phone,
    email,
    ...(logoUrl ? { logoUrl } : {}),
  });

  revalidateAll();
  return { success: "Profil masjid tersimpan." };
}

export async function saveDonationSettingsAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireSession();

  const bankName = formOptional(fd, "bankName");
  const bankAccount = formOptional(fd, "bankAccount");
  const bankHolder = formOptional(fd, "bankHolder");
  const donationNote = formOptional(fd, "donationNote")?.slice(0, 500) ?? null;
  const showDonorNames = fd.get("showDonorNames") === "on";

  const qrisEntry = fd.get("qris");
  const qrisFile = qrisEntry instanceof File && qrisEntry.size > 0 ? qrisEntry : null;
  let qrisUrl: string | null = null;
  if (qrisFile) {
    try {
      qrisUrl = await saveUpload(qrisFile, "qris");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Gagal mengunggah QRIS." };
    }
  }

  await upsertSettings({
    bankName,
    bankAccount,
    bankHolder,
    donationNote,
    showDonorNames,
    ...(qrisUrl ? { qrisUrl } : {}),
  });

  revalidateAll();
  return { success: "Pengaturan donasi tersimpan." };
}

// ---------- Kategori ----------

export async function addCategoryAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireSession();
  const name = formString(fd, "name");
  const kind = formString(fd, "kind");

  if (name.length < 2) return { error: "Nama kategori minimal 2 karakter." };
  if (kind !== "income" && kind !== "expense") {
    return { error: "Jenis kategori tidak valid." };
  }

  const dup = db
    .select()
    .from(categories)
    .where(and(eq(categories.name, name), eq(categories.kind, kind)))
    .get();
  if (dup) return { error: "Kategori dengan nama tersebut sudah ada." };

  db.insert(categories).values({ name, kind }).run();
  revalidateAll();
  return { success: `Kategori "${name}" ditambahkan.` };
}

export async function toggleCategoryAction(fd: FormData) {
  await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  const cat = db.select().from(categories).where(eq(categories.id, id)).get();
  if (!cat) return;
  db.update(categories).set({ isActive: !cat.isActive }).where(eq(categories.id, id)).run();
  revalidateAll();
}

export async function deleteCategoryAction(fd: FormData) {
  await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  if (countCategoryUsage(id) > 0) {
    redirect("/admin/pengaturan?err=kat-dipakai#kategori");
  }
  db.delete(categories).where(eq(categories.id, id)).run();
  revalidateAll();
}

// ---------- Akun pengurus ----------

export async function addUserAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireSession();
  const name = formString(fd, "name");
  const email = formString(fd, "email").toLowerCase();
  const password = formString(fd, "password");

  if (name.length < 2) return { error: "Nama minimal 2 karakter." };
  if (!isEmail(email)) return { error: "Format email tidak valid." };
  if (password.length < 6) return { error: "Password minimal 6 karakter." };

  const dup = db.select().from(users).where(eq(users.email, email)).get();
  if (dup) return { error: "Email sudah terdaftar." };

  db.insert(users)
    .values({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "pengurus",
    })
    .run();

  revalidatePath("/admin/pengaturan");
  return { success: `Akun ${name} berhasil dibuat.` };
}

export async function toggleUserAction(fd: FormData) {
  const session = await requireSession();
  const id = formInt(fd, "id");
  if (!id || id === session.id) {
    redirect("/admin/pengaturan?err=hapus-diri#akun");
  }
  const u = db.select().from(users).where(eq(users.id, id)).get();
  if (!u) return;

  if (u.isActive) {
    const activeCount = db
      .select({ c: count() })
      .from(users)
      .where(eq(users.isActive, true))
      .get();
    if (Number(activeCount?.c ?? 0) <= 1) {
      redirect("/admin/pengaturan?err=user-terakhir#akun");
    }
  }

  db.update(users).set({ isActive: !u.isActive }).where(eq(users.id, id)).run();
  revalidatePath("/admin/pengaturan");
}

export async function deleteUserAction(fd: FormData) {
  const session = await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  if (id === session.id) {
    redirect("/admin/pengaturan?err=hapus-diri#akun");
  }
  db.delete(users).where(eq(users.id, id)).run();
  revalidatePath("/admin/pengaturan");
}

export async function changePasswordAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const current = formString(fd, "current");
  const next = formString(fd, "next");
  const confirm = formString(fd, "confirm");

  if (!current || !next || !confirm) {
    return { error: "Semua kolom password wajib diisi." };
  }
  if (next.length < 6) {
    return { error: "Password baru minimal 6 karakter." };
  }
  if (next !== confirm) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const user = db.select().from(users).where(eq(users.id, session.id)).get();
  if (!user) return { error: "Akun tidak ditemukan." };

  const ok = await verifyPassword(current, user.passwordHash);
  if (!ok) return { error: "Password saat ini salah." };

  db.update(users)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(users.id, user.id))
    .run();

  return { success: "Password berhasil diganti." };
}
