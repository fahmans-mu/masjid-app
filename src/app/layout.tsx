import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "MasjidAmanah — Transparansi Keuangan Masjid",
    template: "%s · MasjidAmanah",
  },
  description:
    "Penggalangan dana, program donasi rutin, dan laporan keuangan masjid yang transparan serta dapat dipertanggungjawabkan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
