import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/Badge";
import { isMosqueExpired, listMosquesForAdmin, mosqueStatus } from "@/lib/queries";
import { formatDateID } from "@/lib/format";
import {
  extendMosqueAction,
  setMosqueUnlimitedAction,
  toggleMosqueActiveAction,
} from "./actions";

export const metadata: Metadata = { title: "Masjid Terdaftar" };

const STATUS_UI: Record<string, { kind: string; label: string }> = {
  aktif: { kind: "aktif", label: "Aktif" },
  "tak-terbatas": { kind: "campaign", label: "Tanpa Batas" },
  kadaluarsa: { kind: "rejected", label: "Kadaluarsa" },
  nonaktif: { kind: "selesai", label: "Nonaktif" },
};

function daysLeftText(activeUntil: Date | null): { text: string; tone: string } {
  if (!activeUntil) return { text: "Tanpa batas", tone: "text-indigo-600" };
  const days = Math.ceil((activeUntil.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { text: `Lewat ${Math.abs(days)} hari`, tone: "text-red-600" };
  if (days <= 14) return { text: `Sisa ${days} hari`, tone: "text-amber-600" };
  return { text: `Sisa ${days} hari`, tone: "text-slate-500" };
}

export default async function SuperadminMasjidPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const mosques = listMosquesForAdmin(q);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Masjid Terdaftar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Semua masjid yang mendaftar mandiri. Perpanjang masa aktif setelah
          infaq terverifikasi, atau nonaktifkan masjid yang melanggar.
        </p>
      </div>

      <form
        method="get"
        className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cari nama masjid..."
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Cari
        </button>
        {q && (
          <Link href="/superadmin/masjid" className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Reset
          </Link>
        )}
      </form>

      {mosques.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-semibold text-slate-700">
            {q ? `Tidak ada masjid dengan nama "${q}"` : "Belum ada masjid terdaftar"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Masjid bisa mendaftar sendiri lewat halaman /daftar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mosques.map((m) => {
            const st = STATUS_UI[mosqueStatus(m)];
            const days = daysLeftText(m.activeUntil);
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">{m.name}</p>
                      {m.isDemo && <Badge kind="campaign">Demo</Badge>}
                      <Badge kind={st.kind}>{st.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      <Link
                        href={`/m/${m.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        /m/{m.slug} <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      {" · "}
                      terdaftar {formatDateID(m.createdAt.toISOString().slice(0, 10))}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Pengurus: {m.adminEmails.length ? m.adminEmails.join(", ") : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Masa aktif panel</p>
                    <p className="font-semibold text-slate-800">
                      {m.activeUntil
                        ? formatDateID(m.activeUntil.toISOString().slice(0, 10))
                        : "Tanpa batas"}
                    </p>
                    <p className={`text-xs font-medium ${days.tone}`}>{days.text}</p>
                    {m.activeUntil && isMosqueExpired(m) && (
                      <p className="mt-0.5 text-xs text-red-500">
                        Panel terkunci — publik tetap tayang
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <form action={extendMosqueAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="id" value={m.id} />
                    <select
                      name="months"
                      defaultValue="1"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="1">1 bulan</option>
                      <option value="6">6 bulan</option>
                      <option value="12">12 bulan</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Perpanjang
                    </button>
                  </form>
                  {m.activeUntil && (
                    <form action={setMosqueUnlimitedAction} className="inline">
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Jadikan Tanpa Batas
                      </button>
                    </form>
                  )}
                  <form action={toggleMosqueActiveAction} className="inline">
                    <input type="hidden" name="id" value={m.id} />
                    <button
                      type="submit"
                      className={`rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                        m.isActive
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {m.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
