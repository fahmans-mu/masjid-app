"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudSun, Moon, MoonStar, Sun, Sunset } from "lucide-react";
import type { PrayerEntry, PrayerSchedule } from "@/lib/prayer-times";

const ICONS = {
  fajr: MoonStar,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: Moon,
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function PrayerTimesCard({ schedule }: { schedule: PrayerSchedule }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.parse(schedule.nowIso));

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const next = useMemo<PrayerEntry | null>(() => {
    const upcoming = schedule.entries.find((e) => Date.parse(e.atIso) > now);
    if (upcoming) return upcoming;
    if (Date.parse(schedule.tomorrowFajr.atIso) > now) {
      return { ...schedule.tomorrowFajr, label: `${schedule.tomorrowFajr.label} besok` };
    }
    return null;
  }, [schedule, now]);

  // Setelah adzan lewat, minta data server baru (pergantian waktu / tanggal)
  useEffect(() => {
    if (!next) return;
    const ms = Date.parse(next.atIso) - Date.now();
    if (ms <= 0 || ms > 24 * 3_600_000) return;
    const timer = setTimeout(() => router.refresh(), ms + 1500);
    return () => clearTimeout(timer);
  }, [next, router]);

  const diff = next ? Math.max(0, Date.parse(next.atIso) - now) : 0;
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return (
    <section id="jadwal-sholat" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Jadwal Sholat</h2>
        <p className="mt-1 text-sm text-slate-500">
          {schedule.dateLabel} · zona {schedule.zoneLabel}
        </p>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-100">
              {next ? `Menuju ${next.label}` : "Jadwal sholat hari ini"}
            </p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums sm:text-5xl">
              {next ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : "--:--:--"}
            </p>
          </div>
          {next && (
            <p className="text-sm text-emerald-100">
              Adzan pukul <span className="font-semibold text-white">{next.timeLabel}</span>
            </p>
          )}
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {schedule.entries.map((entry) => {
            const Icon = ICONS[entry.key];
            const passed = Date.parse(entry.atIso) <= now;
            const isNext = next?.atIso === entry.atIso;
            return (
              <div
                key={entry.key}
                className={`rounded-2xl p-4 transition ${
                  isNext
                    ? "bg-white text-emerald-900 shadow-lg"
                    : passed
                      ? "border border-white/10 bg-white/5 text-emerald-100/50"
                      : "border border-white/15 bg-white/10 text-emerald-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide">
                  {entry.label}
                </p>
                <p className="mt-0.5 text-lg font-bold tabular-nums">{entry.timeLabel}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-xs text-emerald-100/80">
          Dihitung otomatis dengan metode {schedule.methodLabel} — bisa selisih ±1–2 menit
          dari jadwal resmi masjid.
        </p>
      </div>
    </section>
  );
}
