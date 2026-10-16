import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

export function formatRupiah(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return "Rp" + new Intl.NumberFormat("id-ID").format(n);
}

export function formatRupiahRingkas(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return `${sign}Rp${trimDecimal(abs / 1_000_000_000)} M`;
  if (abs >= 1_000_000) return `${sign}Rp${trimDecimal(abs / 1_000_000)} jt`;
  if (abs >= 1_000) return `${sign}Rp${Math.round(abs / 1_000)} rb`;
  return formatRupiah(n);
}

function trimDecimal(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("id-ID").format(Number(value ?? 0));
}

export function parseAmount(value: FormDataEntryValue | null): number {
  if (value === null) return 0;
  const cleaned = String(value).replace(/[^\d-]/g, "");
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
}

export function formatDateID(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return format(d, "d MMM yyyy", { locale: localeID });
}

export function formatDateTimeID(d: Date | null | undefined): string {
  if (!d) return "-";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "-";
  return format(date, "d MMM yyyy HH:mm", { locale: localeID });
}

export function currentPeriod(): string {
  return toPeriod(new Date());
}

export function toPeriod(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function monthLabel(period: string): string {
  const d = new Date(period + "-01T00:00:00");
  if (isNaN(d.getTime())) return period;
  return format(d, "MMMM yyyy", { locale: localeID });
}

export function periodRange(period: string): { start: string; end: string } {
  const d = new Date(period + "-01T00:00:00");
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: `${period}-01`,
    end: `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(
      lastDay.getDate()
    ).padStart(2, "0")}`,
  };
}

export function addMonths(period: string, delta: number): string {
  const d = new Date(period + "-01T00:00:00");
  return toPeriod(new Date(d.getFullYear(), d.getMonth() + delta, 1));
}

export function isValidPeriod(period: string): boolean {
  return /^\d{4}-\d{2}$/.test(period);
}

export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return s || "program";
}

export function percent(value: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

export function maskDonorName(name: string, showNames: boolean): string {
  if (showNames) return name;
  return "Hamba Allah";
}
