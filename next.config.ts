import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.3", "192.168.1.7"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgkgfmwxtvmmefujgfxe.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;