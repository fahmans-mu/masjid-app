"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Landmark, Menu, X } from "lucide-react";

export function PublicNav({
  mosqueName,
  logoUrl,
  basePath,
}: {
  mosqueName: string;
  logoUrl?: string | null;
  basePath: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const LINKS = [
    { href: basePath, label: "Beranda", exact: true },
    { href: `${basePath}/program`, label: "Program Donasi" },
    { href: `${basePath}/qurban`, label: "Tabungan Qurban" },
    { href: `${basePath}/laporan`, label: "Laporan Keuangan" },
    { href: `${basePath}/transparansi`, label: "Buku Kas" },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={basePath} className="flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo masjid"
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Landmark className="h-5 w-5" />
            </span>
          )}
          <span className="truncate text-base font-bold text-slate-900">
            {mosqueName}
          </span>
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
          </div>
        </nav>
      )}
    </header>
  );
}
