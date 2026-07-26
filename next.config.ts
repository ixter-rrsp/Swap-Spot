import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.3", "https://swap-spot-d7b4xu7az-ixter-rrsps-projects.vercel.app"],
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