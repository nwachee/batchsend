import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  basePath: "",
  assetPrefix: "",
  trailingSlash : true,
};

export default nextConfig;
