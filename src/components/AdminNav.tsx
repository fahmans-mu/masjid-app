"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Coins,
  ExternalLink,
  FileText,
  Gift,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Receipt,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/(panel)/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/program", label: "Program Donasi", icon: HandCoins },
  { href: "/admin/donasi", label: "Donasi", icon: Coins, badgeKey: "pending" },
  { href: "/admin/pengeluaran", label: "Pengeluaran", icon: Receipt },
  { href: "/admin/qurban", label: "Tabungan Qurban", icon: PiggyBank, badgeKey: "qurban" },
  { href: "/admin/laporan", label: "Laporan Bulanan", icon: FileText },
  { href: "/admin/infaq", label: "Infaq Aplikasi", icon: Gift },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

export function AdminNav({
  mosqueName,
  mosqueSlug,
  userName,
  pendingCount,
  qurbanPendingCount,
  isDemo,
  isSuper,
}: {
  mosqueName: string;
  mosqueSlug: string;
  userName: string;
  pendingCount: number;
  qurbanPendingCount: number;
  isDemo: boolean;
  isSuper: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const badgeValue = (key: string) => {
    if (key === "pending") return pendingCount;
    if (key === "qurban") return qurbanPendingCount;
    return 0;
  };

  const items = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(item.href, "exact" in item ? item.exact : false);
        const Icon = item.icon;
        const badge = "badgeKey" in item ? badgeValue(item.badgeKey) : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {badge > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                }`}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
      {isSuper && (
        <Link
          href="/superadmin"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
        >
          <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
          <span className="flex-1">Panel Platform</span>
        </Link>
      )}
    </nav>
  );

  const bottom = (
    <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
      <div className="rounded-xl bg-slate-50 px-3.5 py-3">
        <p className="text-xs text-slate-400">Masuk sebagai</p>
        <p className="truncate text-sm font-semibold text-slate-800">{userName}</p>
      </div>
      <Link
        href={`/m/${mosqueSlug}`}
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
      >
        <ExternalLink className="h-4.5 w-4.5" />
        Lihat situs publik
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4.5 w-4.5" />
          Keluar
        </button>
      </form>
    </div>
  );

  const title = (
    <>
      <p className="truncate text-base font-bold text-slate-900">{mosqueName}</p>
      <p className="text-xs text-slate-400">
        {isDemo ? (
          <span className="font-semibold text-amber-600">Mode Demo</span>
        ) : (
          "Panel Pengurus"
        )}
      </p>
    </>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="mb-6 px-2 pt-2">{title}</div>
        {items}
        {bottom}
      </aside>

      {/* Top bar mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="min-w-0">{title}</div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-14 bottom-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-slate-200 bg-white p-4">
            {items}
            {bottom}
          </div>
        </div>
      )}
    </>
  );
}
