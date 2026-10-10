import buildIdentity from "./data/site/build-identity.json";
import type { NextConfig } from "next";

import main from "./data/games/main-game.json";
import { contentSecurityPolicy } from "./src/lib/security.mjs";
const hasVideos = main.content.some((s: { blocks: { type: string }[] }) =>
  s.blocks.some((b) => b.type === "video"),
);
const nextConfig: NextConfig = {
  output: process.env.VERCEL === "1" ? undefined : "standalone",
  generateBuildId: async () => buildIdentity.buildId,
  typescript: {
    tsconfigPath:
      process.env.NODE_ENV === "production"
        ? "tsconfig.production.json"
        : "tsconfig.json",
  },
  distDir:
    process.env.BBI_TYPECHECK === "1"
      ? ".next-types"
      : process.env.NODE_ENV === "development" &&
          process.env.BBI_ISOLATED_PREVIEW === "1"
        ? ".next-preview"
        : process.env.NODE_ENV === "production"
          ? process.env.VERCEL === "1"
            ? ".next"
            : ".next-production"
          : ".next",
  trailingSlash: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-BBI-Build-ID", value: buildIdentity.buildId },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(
              main,
              hasVideos,
              process.env.NODE_ENV === "development",
            ),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
    // Disposable verification previews do not benefit from persistent compiler caches.
    turbopackFileSystemCacheForDev: process.env.BBI_ISOLATED_PREVIEW !== "1",
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
