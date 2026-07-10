import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgkgfmwxtvmmefujgfxe.supabase.co",
      },
    ],
  },
};

export default nextConfig;