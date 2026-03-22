import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true
  },
  transpilePackages: ["@careeros/domain", "@careeros/db"]
};

export default nextConfig;
