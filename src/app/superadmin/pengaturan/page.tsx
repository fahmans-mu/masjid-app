import type { Metadata } from "next";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getPlatformSettings } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { savePlatformSettingsAction } from "./actions";

export const metadata: Metadata = { title: "Pengaturan Platform" };

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

export default function SuperadminPengaturanPage() {
  const settings = getPlatformSettings();
  const monthly = settings?.monthlyAmount ?? 50000;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pengaturan Platform</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nominal infaq, masa uji coba, rekening penerima infaq, dan kontak
          platform yang tampil di halaman publik.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <ActionForm action={savePlatformSettingsAction} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ps-monthly" className={labelCls}>
                Infaq aplikasi per bulan (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="ps-monthly"
                name="monthlyAmount"
                type="number"
                min={10000}
                step={5000}
                required
                defaultValue={monthly}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-slate-400">
                Paket 6 bulan = {formatRupiah(monthly * 6)}, 12 bulan ={" "}
                {formatRupiah(monthly * 12)}.
              </p>
            </div>
            <div>
              <label htmlFor="ps-trial" className={labelCls}>
                Masa uji coba masjid baru (hari) <span className="text-red-500">*</span>
              </label>
              <input
                id="ps-trial"
                name="trialDays"
                type="number"
                min={0}
                max={365}
                required
                defaultValue={settings?.trialDays ?? 30}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-slate-400">
                Dihitung sejak masjid mendaftar. Setelah habis, panel terkunci
                sampai infaq diverifikasi.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="ps-bank" className={labelCls}>
                Nama bank
              </label>
              <input
                id="ps-bank"
                name="bankName"
                type="text"
                defaultValue={settings?.bankName ?? ""}
                placeholder="cth: Bank Syariah Indonesia"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="ps-acc" className={labelCls}>
                Nomor rekening
              </label>
              <input
                id="ps-acc"
                name="bankAccount"
                type="text"
                defaultValue={settings?.bankAccount ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="ps-holder" className={labelCls}>
                Atas nama
              </label>
              <input
                id="ps-holder"
                name="bankHolder"
                type="text"
                defaultValue={settings?.bankHolder ?? ""}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ps-phone" className={labelCls}>
                WhatsApp / telepon platform
              </label>
              <input
                id="ps-phone"
                name="contactPhone"
                type="text"
                defaultValue={settings?.contactPhone ?? ""}
                placeholder="cth: 0812xxxxxxx"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="ps-email" className={labelCls}>
                Email platform
              </label>
              <input
                id="ps-email"
                name="contactEmail"
                type="email"
                defaultValue={settings?.contactEmail ?? ""}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="ps-note" className={labelCls}>
              Catatan infaq (tampil di halaman /infaq)
            </label>
            <textarea
              id="ps-note"
              name="infaqNote"
              rows={3}
              defaultValue={settings?.infaqNote ?? ""}
              placeholder="cth: Konfirmasi infaq diverifikasi maksimal 1×24 jam pada hari kerja."
              className={inputCls}
            />
          </div>

          <SubmitButton pendingText="Menyimpan...">
            Simpan Pengaturan Platform
          </SubmitButton>
        </ActionForm>
      </section>

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-sm text-indigo-900">
        <p className="font-semibold">Dipakai di mana?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Nominal bulanan → halaman /infaq (paket 1/6/12 bulan) dan menu Infaq Aplikasi panel masjid.</li>
          <li>Rekening → ditampilkan ke masjid yang akan mengirim infaq aplikasi.</li>
          <li>Masa uji coba → otomatis diberikan saat masjid baru mendaftar.</li>
        </ul>
      </div>
    </div>
  );
}
