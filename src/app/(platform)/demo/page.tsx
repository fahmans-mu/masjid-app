import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import {
  ArrowRight,
  Eye,
  FileText,
  HandCoins,
  PiggyBank,
  PlayCircle,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { db } from "@/lib/db";
import { mosques } from "@/lib/schema";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { startDemoAction } from "./actions";

export const metadata: Metadata = {
  title: "Coba Demo",
};

export default function DemoPage() {
  const demoMosque = db
    .select()
    .from(mosques)
    .where(and(eq(mosques.isDemo, true), eq(mosques.isActive, true)))
    .get();

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
            <PlayCircle className="h-3.5 w-3.5" />
            Mode Demo
          </span>
          <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            Coba seluruh fitur tanpa perlu mendaftar
          </h1>
          <p className="mt-4 max-w-2xl text-indigo-100">
            Masuk ke panel pengurus masjid contoh yang sudah berisi data — program
            donasi, tabungan qurban, laporan bulanan, dan buku kas. Semua tombol
            bisa dicoba sepuasnya; data demo direset otomatis setiap hari.
          </p>

          {demoMosque ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ActionForm action={startDemoAction}>
                <SubmitButton
                  variant="secondary"
                  className="!border-0 bg-white !text-indigo-700 hover:bg-indigo-50"
                  pendingText="Menyiapkan demo..."
                >
                  <PlayCircle className="h-4 w-4" />
                  Masuk ke Demo
                </SubmitButton>
              </ActionForm>
              <Link
                href={`/m/${demoMosque.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Eye className="h-4 w-4" />
                Lihat Halaman Publik Demo
              </Link>
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-white/10 px-4 py-3 text-sm text-indigo-100">
              Demo sedang tidak tersedia. Silakan coba lagi nanti.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Apa saja yang bisa dicoba?
          </h2>
          <p className="mt-2 text-slate-500">
            Semua fitur lengkap — persis seperti yang akan dipakai pengurus masjid
            Anda.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Wallet,
              title: "Panel pengurus",
              desc: "Dashboard saldo, grafik bulanan, dan verifikasi donasi masuk.",
            },
            {
              icon: HandCoins,
              title: "Program & donasi",
              desc: "Tambah program, catat donasi manual, verifikasi bukti transfer.",
            },
            {
              icon: PiggyBank,
              title: "Tabungan qurban",
              desc: "Peserta qurban, setoran bertahap, dan progres menuju lunas.",
            },
            {
              icon: FileText,
              title: "Laporan & bukti publik",
              desc: "Susun laporan bulanan dan publikasikan ke halaman masjid.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Aman — terpisah total</p>
              <p className="mt-1 text-sm text-slate-500">
                Data demo terpisah dari data masjid sungguhan. Tidak ada risiko
                tercampur.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <RefreshCcw className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Selalu segar</p>
              <p className="mt-1 text-sm text-slate-500">
                Data demo direset otomatis, jadi setiap pengunjung mendapat
                pengalaman yang sama.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Sudah cocok? Daftarkan masjid Anda
          </h2>
          <p className="mt-2 text-slate-500">
            Gratis, langsung aktif, dan halaman publik masjid Anda siap dibagikan
            ke jamaah.
          </p>
          <Link
            href="/daftar"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Daftar Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
