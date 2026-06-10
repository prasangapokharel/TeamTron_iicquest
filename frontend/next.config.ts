import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
      {
        protocol: "https",
        hostname: "nepalbank.com.np",
        pathname: "/frontend/images/**",
      },
      {
        protocol: "https",
        hostname: "iic.edu.np",
        pathname: "/image/**",
      },
    ],
  },
};

export default nextConfig;
