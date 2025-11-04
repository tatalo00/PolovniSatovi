import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
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

    // Ignore node: protocol imports in client bundle
    config.resolve.alias = {
      ...config.resolve.alias,
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
  // We're explicitly using webpack via --webpack flag
  turbopack: {},
};

export default nextConfig;
