import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude legacy Node packages from Turbopack/Webpack bundling
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
