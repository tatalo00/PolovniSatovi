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
  // Enable React Compiler for automatic memoization (stable in Next.js 16)
  reactCompiler: true,
  // Performance optimizations
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
  },
  // Turbopack configuration (now default bundler in Next.js 16)
  turbopack: {
    resolveAlias: {
      "@": __dirname,
    },
  },
};

export default async function nextConfig(): Promise<NextConfig> {
  if (process.env.ANALYZE !== "true") return baseConfig;

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - @next/bundle-analyzer is an optional dev dependency
    const bundleAnalyzer = (await import("@next/bundle-analyzer")).default;
    const withBundleAnalyzer = bundleAnalyzer({ enabled: true });
    return withBundleAnalyzer(baseConfig);
  } catch {
    console.warn("Bundle analyzer not available, skipping...");
    return baseConfig;
  }
}
