export type ActionState = { error?: string; success?: string } | null;

export function formString(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export function formOptional(fd: FormData, key: string): string | null {
  const v = formString(fd, key);
  return v.length ? v : null;
}

export function formInt(fd: FormData, key: string): number | null {
  const raw = formString(fd, key);
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d]/g, "");
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
}

export function formDate(fd: FormData, key: string): string | null {
  const v = formString(fd, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

const METHOD_LABELS: Record<string, string> = {
  transfer: "Transfer Bank",
  qris: "QRIS",
  cash: "Tunai",
  other: "Lainnya",
};

export function methodLabel(method: string | null | undefined): string {
  return METHOD_LABELS[method ?? "other"] ?? "Lainnya";
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
