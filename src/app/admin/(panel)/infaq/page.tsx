import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Gift } from "lucide-react";
import { Badge } from "@/components/Badge";
import { AppInfaqForm } from "@/components/AppInfaqForm";
import { CopyButton } from "@/components/CopyButton";
import { requireMosqueSession } from "@/lib/auth";
import {
  getMosqueById,
  getPlatformSettings,
  isMosqueExpired,
  listAppInfaqsForMosque,
} from "@/lib/queries";
import {
  formatDateID,
  formatDateTimeID,
  formatRupiah,
  todayISO,
} from "@/lib/format";
import { methodLabel, statusLabel } from "@/lib/action-utils";

export const metadata: Metadata = { title: "Infaq Aplikasi" };

function daysLeftText(activeUntil: Date | null): { text: string; tone: "ok" | "warn" | "bad" } {
  if (!activeUntil) return { text: "Tanpa batas", tone: "ok" };
  const days = Math.ceil(
    (activeUntil.getTime() - new Date(todayISO() + "T00:00:00").getTime()) / 86_400_000
  );
  if (days < 0) return { text: "Masa aktif berakhir", tone: "bad" };
  if (days === 0) return { text: "Berakhir hari ini", tone: "bad" };
  if (days <= 14) return { text: `${days} hari lagi`, tone: "warn" };
  return { text: `${days} hari lagi`, tone: "ok" };
}

export default async function AdminInfaqPage() {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return null;

  const platform = getPlatformSettings();
  const monthlyAmount = platform?.monthlyAmount ?? 50000;
  const history = listAppInfaqsForMosque(mosque.id);
  const expired = !mosque.isDemo && isMosqueExpired(mosque);
  const status = daysLeftText(mosque.activeUntil);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Infaq Aplikasi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Masa aktif panel {mosque.name} — informasinya dan perpanjangan.
        </p>
      </div>

      {expired && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Masa aktif panel sudah berakhir.</p>
          <p className="mt-1">
            Panel terkunci sementara. Kirim konfirmasi infaq di bawah — setelah
            diverifikasi, panel aktif kembali dengan seluruh data utuh.
          </p>
        </div>
      )}

      {/* Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Status masa aktif</p>
          <p className="mt-1.5">
            {mosque.isDemo ? (
              <Badge kind="pending">Mode Demo — tanpa batas</Badge>
            ) : status.tone === "ok" ? (
              <Badge kind="aktif">Aktif — {status.text}</Badge>
            ) : status.tone === "warn" ? (
              <Badge kind="pending">Segera berakhir — {status.text}</Badge>
            ) : (
              <Badge kind="rejected">{status.text}</Badge>
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Aktif sampai</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {mosque.activeUntil ? formatDateID(mosque.activeUntil.toISOString().slice(0, 10)) : "Tanpa batas"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Infaq bulanan</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatRupiah(monthlyAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            <Link href="/infaq" target="_blank" className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline">
              Info lengkap <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Form konfirmasi */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <Gift className="h-5 w-5 text-emerald-600" />
              Konfirmasi Pembayaran Infaq
            </h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Transfer ke rekening infaq, lalu unggah bukti transfer di sini.
              Masa aktif otomatis ditambahkan setelah diverifikasi (maks 1×24 jam).
            </p>
            {mosque.isDemo ? (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Masjid demo tidak memerlukan infaq — semua fitur terbuka penuh.
              </p>
            ) : (
              <AppInfaqForm
                mosques={[{ id: mosque.id, name: mosque.name, slug: mosque.slug }]}
                monthlyAmount={monthlyAmount}
                lockedMosqueId={mosque.id}
              />
            )}
          </div>
        </div>

        {/* Rekening & riwayat */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold text-slate-900">Rekening Infaq</h2>
            {platform?.bankName || platform?.bankAccount ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-slate-500">{platform?.bankName}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-lg font-bold tracking-wide text-slate-900">
                    {platform?.bankAccount}
                  </p>
                  {platform?.bankAccount && <CopyButton text={platform.bankAccount} />}
                </div>
                {platform?.bankHolder && (
                  <p className="text-sm text-slate-500">a.n. {platform.bankHolder}</p>
                )}
                {platform?.infaqNote && (
                  <p className="text-xs text-slate-400">{platform.infaqNote}</p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                Info rekening belum diatur. Hubungi tim MasjidAmanah.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold text-slate-900">Riwayat Infaq</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">Belum ada riwayat infaq.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {history.map((h) => (
                  <li key={h.id} className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {h.months} bulan · {formatRupiah(h.amount)}
                      </p>
                      <Badge kind={h.status}>{statusLabel(h.status)}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {h.senderName} · {methodLabel(h.method)} ·{" "}
                      {formatDateTimeID(h.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
