"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Landmark, LogIn, Menu, X } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const LINKS = [
  { href: "/", label: "Beranda", exact: true },
  { href: "/masjid", label: "Daftar Masjid" },
  { href: "/infaq", label: "Infaq Aplikasi" },
  { href: "/demo", label: "Demo" },
];

export function PlatformNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Landmark className="h-5 w-5" />
          </span>
          <span className="text-base font-bold text-slate-900">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                isActive(l.href, l.exact)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/daftar"
            className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <LogIn className="h-4 w-4" />
            Masuk
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3.5 py-2.5 text-sm font-medium ${
                  isActive(l.href, l.exact)
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                href="/daftar"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700"
              >
                Daftar Gratis
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Masuk
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
