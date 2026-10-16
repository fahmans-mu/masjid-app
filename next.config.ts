import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // upload bukti transfer / nota (maks 5MB di validasi aplikasi)
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
