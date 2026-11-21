import { CalculationMethod, Coordinates, PrayerTimes } from "adhan";

export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export const PRAYER_KEYS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: "Subuh",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Maghrib",
  isha: "Isya",
};

export const PRAYER_TIMEZONES = [
  { value: "Asia/Jakarta", label: "WIB — Asia/Jakarta" },
  { value: "Asia/Makassar", label: "WITA — Asia/Makassar" },
  { value: "Asia/Jayapura", label: "WIT — Asia/Jayapura" },
] as const;

export const PRAYER_METHODS = [
  { value: "kemenag", label: "Kemenag RI (Subuh 20°, Isya 18°)" },
  { value: "mwl", label: "Muslim World League (18°, 17°)" },
] as const;

export type PrayerOffsets = Record<PrayerKey, number>;

const ZERO_OFFSETS: PrayerOffsets = {
  fajr: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

export function parsePrayerOffsets(json: string | null | undefined): PrayerOffsets {
  if (!json) return { ...ZERO_OFFSETS };
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    const out = { ...ZERO_OFFSETS };
    for (const key of PRAYER_KEYS) {
      const n = Number(raw[key]);
      if (Number.isFinite(n)) out[key] = Math.trunc(n);
    }
    return out;
  } catch {
    return { ...ZERO_OFFSETS };
  }
}

export function zoneShortLabel(timezone: string): string {
  if (timezone === "Asia/Makassar") return "WITA";
  if (timezone === "Asia/Jayapura") return "WIT";
  return "WIB";
}

export type PrayerSettings = {
  latitude: number;
  longitude: number;
  timezone: string;
  prayerMethod: string;
  prayerOffsets: string | null;
};

export type PrayerEntry = {
  key: PrayerKey;
  label: string;
  timeLabel: string;
  atIso: string;
};

export type PrayerSchedule = {
  timezone: string;
  zoneLabel: string;
  methodLabel: string;
  dateLabel: string;
  entries: PrayerEntry[];
  tomorrowFajr: PrayerEntry;
  nowIso: string;
};

export function methodLabel(method: string): string {
  if (method === "mwl") return "Muslim World League";
  return "Kemenag RI";
}

function calculationParams(method: string) {
  if (method === "mwl") return CalculationMethod.MuslimWorldLeague();
  const params = CalculationMethod.Other();
  params.fajrAngle = 20;
  params.ishaAngle = 18;
  return params;
}

function datePartsInZone(at: Date, timeZone: string) {
  const parts: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function addDays(
  parts: { year: number; month: number; day: number },
  days: number
) {
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function computeDay(
  settings: PrayerSettings,
  parts: { year: number; month: number; day: number }
): Record<PrayerKey, Date> {
  const coordinates = new Coordinates(settings.latitude, settings.longitude);
  // adhan hanya membaca komponen tanggal dari argumen ini (hasilnya instan UTC)
  const reference = new Date(parts.year, parts.month - 1, parts.day, 12);
  const times = new PrayerTimes(coordinates, reference, calculationParams(settings.prayerMethod));
  const offsets = parsePrayerOffsets(settings.prayerOffsets);

  const out = {} as Record<PrayerKey, Date>;
  for (const key of PRAYER_KEYS) {
    out[key] = new Date(times[key].getTime() + offsets[key] * 60_000);
  }
  return out;
}

export function getPrayerSchedule(
  settings: PrayerSettings,
  now: Date = new Date()
): PrayerSchedule {
  const today = datePartsInZone(now, settings.timezone);
  const tomorrow = addDays(today, 1);
  const todayTimes = computeDay(settings, today);
  const tomorrowTimes = computeDay(settings, tomorrow);

  const timeFmt = new Intl.DateTimeFormat("id-ID", {
    timeZone: settings.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    timeZone: settings.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    timezone: settings.timezone,
    zoneLabel: zoneShortLabel(settings.timezone),
    methodLabel: methodLabel(settings.prayerMethod),
    dateLabel: dateFmt.format(now),
    nowIso: now.toISOString(),
    entries: PRAYER_KEYS.map((key) => ({
      key,
      label: PRAYER_LABELS[key],
      timeLabel: timeFmt.format(todayTimes[key]),
      atIso: todayTimes[key].toISOString(),
    })),
    tomorrowFajr: {
      key: "fajr",
      label: PRAYER_LABELS.fajr,
      timeLabel: timeFmt.format(tomorrowTimes.fajr),
      atIso: tomorrowTimes.fajr.toISOString(),
    },
  };
}
