import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.3", "precook-configure-swept.ngrok-free.dev"],
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