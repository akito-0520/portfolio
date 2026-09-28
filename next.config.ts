import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  // すべてのページを静的な HTML に書き出す（out/）。
  // Cloudflare Workers の静的アセットとしても、Vercel でもそのまま配信できる
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
