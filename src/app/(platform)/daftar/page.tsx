import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getPlatformSettings } from "@/lib/queries";
import { APP_NAME } from "@/lib/constants";
import { registerMosqueAction } from "./actions";

export const metadata: Metadata = {
  title: "Daftarkan Masjid",
};

export default function DaftarPage() {
  const platform = getPlatformSettings();
  const trialDays = platform?.trialDays ?? 30;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Daftarkan Masjid Anda
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-500">
          Gratis, langsung aktif. Setelah mendaftar Anda bisa langsung mengelola
          keuangan masjid dari panel pengurus.
        </p>
        <div className="mx-auto mt-4 flex max-w-lg flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Uji coba {trialDays} hari, tanpa kartu kredit
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Halaman publik langsung jadi
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <ActionForm action={registerMosqueAction} className="space-y-8">
          <input
            type="text"
            name="website"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* Data masjid */}
          <section>
            <h2 className="mb-4 font-bold text-slate-900">Data Masjid</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="rg-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nama masjid <span className="text-red-500">*</span>
                </label>
                <input
                  id="rg-name"
                  name="mosqueName"
                  type="text"
                  required
                  maxLength={120}
                  placeholder="cth: Masjid Al-Ikhlas"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="rg-slug" className="mb-1.5 block text-sm font-medium text-slate-700">
                  URL halaman{" "}
                  <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded-xl bg-slate-100 px-3 py-2.5 text-sm text-slate-500">
                    /m/
                  </span>
                  <input
                    id="rg-slug"
                    name="slug"
                    type="text"
                    maxLength={80}
                    placeholder="al-ikhlas (kosongkan = otomatis)"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Alamat halaman publik masjid, huruf kecil tanpa spasi.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rg-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Telp/WA masjid{" "}
                    <span className="font-normal text-slate-400">(opsional)</span>
                  </label>
                  <input
                    id="rg-phone"
                    name="mosquePhone"
                    type="tel"
                    maxLength={30}
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label htmlFor="rg-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email masjid{" "}
                    <span className="font-normal text-slate-400">(opsional)</span>
                  </label>
                  <input
                    id="rg-email"
                    name="mosqueEmail"
                    type="email"
                    maxLength={120}
                    placeholder="sekretariat@masjid.id"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="rg-address" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Alamat <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  id="rg-address"
                  name="address"
                  type="text"
                  maxLength={300}
                  placeholder="cth: Jl. Melati No. 12, Kel. Sukamaju"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </section>

          {/* Akun pengurus */}
          <section>
            <h2 className="mb-1 font-bold text-slate-900">Akun Pengurus</h2>
            <p className="mb-4 text-sm text-slate-500">
              Akun ini dipakai untuk masuk ke panel pengurus. Bisa menambah akun
              pengurus lain nanti dari menu Pengaturan.
            </p>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rg-admin-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nama pengurus <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rg-admin-name"
                    name="adminName"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="cth: Ust. Ahmad Fauzi"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label htmlFor="rg-admin-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email login <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rg-admin-email"
                    name="adminEmail"
                    type="email"
                    required
                    maxLength={120}
                    placeholder="nama@gmail.com"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rg-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rg-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label htmlFor="rg-password2" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Ulangi password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rg-password2"
                    name="password2"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Dengan mendaftar, Anda setuju mengelola data masjid dengan amanah.
            </p>
            <SubmitButton className="sm:w-auto" pendingText="Mendaftarkan...">
              Daftar & Masuk Panel
            </SubmitButton>
          </div>
        </ActionForm>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link href="/admin/login" className="font-semibold text-emerald-700 hover:underline">
          Masuk di sini
        </Link>{" "}
        · Ingin lihat dulu?{" "}
        <Link href="/demo" className="font-semibold text-emerald-700 hover:underline">
          Coba demo {APP_NAME}
        </Link>
      </p>
    </div>
  );
}
