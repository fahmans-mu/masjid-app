"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Building2, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { logoutAction } from "@/app/admin/(panel)/actions";

const LINKS = [
  { href: "/superadmin", label: "Ringkasan", exact: true },
  { href: "/superadmin/masjid", label: "Masjid Terdaftar" },
  { href: "/superadmin/infaq", label: "Infaq Aplikasi" },
  { href: "/superadmin/pengaturan", label: "Pengaturan Platform" },
];

export function SuperNav({
  userName,
  pendingCount,
}: {
  userName: string;
  pendingCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const navLinks = (
    <>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
            isActive(l.href, l.exact)
              ? "bg-indigo-600 text-white"
              : "text-indigo-100 hover:bg-indigo-800"
          }`}
        >
          {l.label}
          {l.href === "/superadmin/infaq" && pendingCount > 0 && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
              {pendingCount}
            </span>
          )}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-indigo-900 bg-indigo-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/superadmin" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-white">
                MasjidAmanah
              </span>
              <span className="block text-xs text-indigo-300">
                Panel Platform
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">{navLinks}</nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-700 px-3.5 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-800"
          >
            <Building2 className="h-4 w-4" /> Panel Masjid
          </Link>
          <span className="max-w-32 truncate text-sm text-indigo-200">
            {userName}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              className="rounded-xl p-2 text-indigo-200 hover:bg-indigo-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-xl p-2 text-indigo-100 hover:bg-indigo-800 lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-indigo-900 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">{navLinks}</div>
          <div className="mt-3 flex items-center justify-between border-t border-indigo-900 pt-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-700 px-3.5 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-800"
            >
              <Building2 className="h-4 w-4" /> Panel Masjid
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-indigo-200">{userName}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Keluar"
                  className="rounded-xl p-2 text-indigo-200 hover:bg-indigo-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
