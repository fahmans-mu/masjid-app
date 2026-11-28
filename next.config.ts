import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deploy VPS mengarahkan build ke folder staging agar .next yang sedang
  // disajikan tidak tertimpa; default tetap .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverActions: {
      // upload bukti transfer / nota (maks 5MB di validasi aplikasi)
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
