import { Building2, QrCode } from "lucide-react";
import { CopyButton } from "./CopyButton";
import type { MosqueSettings } from "@/lib/queries";

export function DonationMethods({
  settings,
}: {
  settings: MosqueSettings | null;
}) {
  const s = settings;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Building2 className="h-4 w-4 text-emerald-600" />
            Transfer Bank
          </div>
          {s?.bankName || s?.bankAccount ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-slate-500">{s?.bankName}</p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-lg font-bold tracking-wide text-slate-900">
                  {s?.bankAccount}
                </p>
                {s?.bankAccount && <CopyButton text={s.bankAccount} />}
              </div>
              {s?.bankHolder && (
                <p className="text-sm text-slate-500">a.n. {s.bankHolder}</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Info rekening belum diatur pengurus.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <QrCode className="h-4 w-4 text-emerald-600" />
            QRIS
          </div>
          {s?.qrisUrl ? (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.qrisUrl}
                alt="QRIS masjid"
                className="h-40 w-40 rounded-xl border border-slate-200 object-contain"
              />
              <p className="mt-2 text-xs text-slate-500">
                Scan menggunakan aplikasi bank / e-wallet apa pun.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Gambar QRIS belum diatur pengurus.
            </p>
          )}
        </div>
      </div>
      {s?.donationNote && (
        <p className="text-xs text-slate-500">{s.donationNote}</p>
      )}
    </div>
  );
}
