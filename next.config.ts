import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js 15: "Don't touch this library, just let it run."
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;