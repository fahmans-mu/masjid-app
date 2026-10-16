import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function validateUpload(file: File | null): string | null {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_SIZE) return "Ukuran file maksimal 5MB.";
  if (!ALLOWED[file.type]) return "Format file harus JPG, PNG, WEBP, atau PDF.";
  return null;
}

export async function saveUpload(file: File | null, prefix: string): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  const error = validateUpload(file);
  if (error) throw new Error(error);

  const ext = ALLOWED[file.type];
  const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/api/files/${name}`;
}
