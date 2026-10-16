import type { Metadata } from "next";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getSettings } from "@/lib/queries";
import { loginAction } from "./actions";

export const metadata: Metadata = {
  title: "Masuk Panel Pengurus",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const settings = getSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Landmark className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold">
            {settings?.mosqueName ?? "Panel Pengurus"}
          </h1>
          <p className="mt-1 text-sm text-emerald-100">
            Masuk untuk mengelola keuangan masjid
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <ActionForm action={loginAction} className="space-y-4">
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@masjid.id"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <SubmitButton className="w-full" pendingText="Memeriksa...">
              Masuk
            </SubmitButton>
          </ActionForm>

          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Akun awal (bisa diubah di Pengaturan):{" "}
            <span className="font-semibold text-slate-700">admin@masjid.id</span> /{" "}
            <span className="font-semibold text-slate-700">admin123</span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-emerald-100 hover:text-white hover:underline">
            ← Kembali ke halaman publik
          </Link>
        </p>
      </div>
    </div>
  );
}
