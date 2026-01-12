import type { NextConfig } from "next";
import { config as loadDotenv } from "dotenv";
import { existsSync } from "fs";
import path from "path";

for (const envPath of [
  path.resolve(__dirname, ".env.local"),
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, "..", ".env.local"),
  path.resolve(__dirname, "..", ".env"),
]) {
  if (existsSync(envPath)) {
    loadDotenv({ path: envPath, override: false });
  }
}

const baseConfig: NextConfig = {
  // Fix workspace root detection for monorepo-like setups
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Optimize images
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Use webpack instead of Turbopack for Prisma client compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Prisma client and Node.js modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };

      // Ignore Prisma client in client bundle
      config.externals = config.externals || [];
      config.externals.push({
        "@prisma/client": "commonjs @prisma/client",
      });
    }

    // Ensure path aliases work correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      ...(isServer
        ? {}
        : {
            "node:process": false,
            "node:path": false,
            "node:url": false,
            "node:fs": false,
          }),
    };

    return config;
  },
  // Add empty turbopack config to silence Next.js 16 warning
  turbopack: {},
};

export default async function nextConfig(): Promise<NextConfig> {
  if (process.env.ANALYZE !== "true") return baseConfig;

  try {
    const bundleAnalyzer = (await import("@next/bundle-analyzer")).default;
    const withBundleAnalyzer = bundleAnalyzer({ enabled: true });
    return withBundleAnalyzer(baseConfig);
  } catch {
    console.warn("Bundle analyzer not available, skipping...");
    return baseConfig;
  }
}
