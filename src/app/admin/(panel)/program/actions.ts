"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { programs } from "@/lib/schema";
import { requireSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import {
  formDate,
  formInt,
  formOptional,
  formString,
  type ActionState,
} from "@/lib/action-utils";
import { slugify } from "@/lib/format";

function revalidatePublic() {
  revalidatePath("/admin/program");
  revalidatePath("/program");
  revalidatePath("/");
}

export async function saveProgramAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireSession();

  const id = formInt(fd, "id");
  const type = formString(fd, "type");
  const title = formString(fd, "title");
  const description = formOptional(fd, "description");
  const startDate = formDate(fd, "startDate");
  const endDate = formDate(fd, "endDate");
  const isActive = fd.get("isActive") === "on";

  if (title.length < 3) {
    return { error: "Judul program minimal 3 karakter." };
  }
  if (type !== "campaign" && type !== "rutin") {
    return { error: "Jenis program tidak valid." };
  }

  let targetAmount: number | null = null;
  let monthlyTarget: number | null = null;

  if (type === "campaign") {
    targetAmount = formInt(fd, "targetAmount");
    if (!targetAmount || targetAmount < 10_000) {
      return { error: "Target dana campaign minimal Rp10.000." };
    }
    if (endDate && startDate && endDate < startDate) {
      return { error: "Tanggal selesai tidak boleh sebelum tanggal mulai." };
    }
  } else {
    monthlyTarget = formInt(fd, "monthlyTarget");
    if (!monthlyTarget || monthlyTarget < 10_000) {
      return { error: "Target bulanan program rutin minimal Rp10.000." };
    }
  }

  const imageEntry = fd.get("image");
  const imageFile =
    imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;
  let uploaded: string | null = null;
  if (imageFile) {
    try {
      uploaded = await saveUpload(imageFile, "program");
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Gagal mengunggah gambar.",
      };
    }
  }

  if (id) {
    const existing = db.select().from(programs).where(eq(programs.id, id)).get();
    if (!existing) return { error: "Program tidak ditemukan." };

    db.update(programs)
      .set({
        type,
        title,
        description,
        targetAmount: type === "campaign" ? targetAmount : null,
        monthlyTarget: type === "rutin" ? monthlyTarget : null,
        startDate,
        endDate: type === "campaign" ? endDate : null,
        isActive,
        imageUrl: uploaded ?? existing.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, id))
      .run();
  } else {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let n = 1;
    while (db.select().from(programs).where(eq(programs.slug, slug)).get()) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    db.insert(programs)
      .values({
        slug,
        type,
        title,
        description,
        targetAmount,
        monthlyTarget,
        startDate,
        endDate: type === "campaign" ? endDate : null,
        isActive,
        imageUrl: uploaded,
      })
      .run();
  }

  revalidatePublic();
  redirect("/admin/program");
}

export async function toggleProgramActiveAction(fd: FormData) {
  await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  const existing = db.select().from(programs).where(eq(programs.id, id)).get();
  if (!existing) return;
  db.update(programs)
    .set({ isActive: !existing.isActive, updatedAt: new Date() })
    .where(eq(programs.id, id))
    .run();
  revalidatePublic();
}

export async function deleteProgramAction(fd: FormData) {
  await requireSession();
  const id = formInt(fd, "id");
  if (!id) return;
  db.delete(programs).where(eq(programs.id, id)).run();
  revalidatePublic();
}
