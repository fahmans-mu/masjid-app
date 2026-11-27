"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Compass,
  FileText,
  HandCoins,
  Home,
  Landmark,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Phone,
  PiggyBank,
  Wallet,
  X,
} from "lucide-react";

type MobileTabBarProps = {
  basePath: string;
  mosqueName: string;
  tagline?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
};

export function MobileTabBar({
  basePath,
  mosqueName,
  tagline,
  address,
  phone,
  email,
  logoUrl,
}: MobileTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    if (!hash || pathname !== basePath) return;
    const target = document.getElementById(hash.slice(1));
    if (target) {
      const timer = window.setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => window.clearTimeout(timer);
    }
  }, [hash, pathname, basePath]);

  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const isHome = pathname === basePath;
  const isKiblat = isHome && hash === "#arah-kiblat";

  const openKiblat = () => {
    if (isHome) {
      document.getElementById("arah-kiblat")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.history.replaceState(null, "", "#arah-kiblat");
      setHash("#arah-kiblat");
    } else {
      router.push(`${basePath}#arah-kiblat`);
    }
  };

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition ${
      active ? "text-emerald-700" : "text-slate-400"
    }`;

  const iconClass = (active: boolean) =>
    `flex h-8 w-12 items-center justify-center rounded-full transition ${
      active ? "bg-emerald-50" : ""
    }`;

  const secondaryLinks = [
    { href: `${basePath}/program`, label: "Program donasi", icon: HandCoins },
    { href: `${basePath}/qurban`, label: "Tabungan qurban", icon: PiggyBank },
    { href: `${basePath}/laporan`, label: "Laporan keuangan", icon: FileText },
    { href: `${basePath}/transparansi`, label: "Buku kas terbuka", icon: Wallet },
    {
      href: `${basePath}/donasi/konfirmasi`,
      label: "Konfirmasi donasi",
      icon: Landmark,
    },
  ];

  return (
    <>
      <nav
        aria-label="Navigasi aplikasi"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      >
        <div className="border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mx-auto grid max-w-lg grid-cols-5">
            <Link href={basePath} className={tabClass(isHome && !isKiblat)}>
              <span className={iconClass(isHome && !isKiblat)}>
                <Home className="h-[22px] w-[22px]" strokeWidth={isHome && !isKiblat ? 2.4 : 1.9} />
              </span>
              Beranda
            </Link>
            <Link
              href={`${basePath}/program`}
              className={tabClass(pathname.startsWith(`${basePath}/program`))}
            >
              <span className={iconClass(pathname.startsWith(`${basePath}/program`))}>
                <HandCoins
                  className="h-[22px] w-[22px]"
                  strokeWidth={pathname.startsWith(`${basePath}/program`) ? 2.4 : 1.9}
                />
              </span>
              Program
            </Link>
            <button type="button" onClick={openKiblat} className={tabClass(isKiblat)}>
              <span className={iconClass(isKiblat)}>
                <Compass className="h-[22px] w-[22px]" strokeWidth={isKiblat ? 2.4 : 1.9} />
              </span>
              Kiblat
            </button>
            <Link
              href={`${basePath}/laporan`}
              className={tabClass(pathname.startsWith(`${basePath}/laporan`))}
            >
              <span className={iconClass(pathname.startsWith(`${basePath}/laporan`))}>
                <FileText
                  className="h-[22px] w-[22px]"
                  strokeWidth={pathname.startsWith(`${basePath}/laporan`) ? 2.4 : 1.9}
                />
              </span>
              Laporan
            </Link>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={tabClass(sheetOpen)}
            >
              <span className={iconClass(sheetOpen)}>
                <Menu className="h-[22px] w-[22px]" strokeWidth={sheetOpen ? 2.4 : 1.9} />
              </span>
              Menu
            </button>
          </div>
        </div>
      </nav>

      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex justify-center pt-2.5">
              <span className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-start justify-between gap-4 px-5 pt-3">
              <div className="flex min-w-0 items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo masjid"
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Landmark className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{mosqueName}</p>
                  {tagline && <p className="truncate text-xs text-slate-500">{tagline}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 px-3">
              {secondaryLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition active:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                );
              })}
            </div>

            {(address || phone || email) && (
              <div className="mx-5 mt-3 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Sekretariat
                </p>
                {address && (
                  <p className="mt-2 flex gap-2 text-sm text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {address}
                  </p>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="mt-1.5 flex gap-2 text-sm text-slate-600">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {phone}
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="mt-1.5 flex gap-2 text-sm text-slate-600">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {email}
                  </a>
                )}
              </div>
            )}

            <div className="mx-5 mt-3 border-t border-slate-100 pt-3">
              <Link
                href="/admin/login"
                onClick={() => setSheetOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500"
              >
                <LogIn className="h-4 w-4" />
                Login pengurus
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
