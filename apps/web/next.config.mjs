import { fileURLToPath } from "node:url";
import path from "node:path";

/** @type {import("next").NextConfig} */
const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const nextConfig = {
  experimental: {
    externalDir: true,
    turbopack: {
      root: monorepoRoot
    }
  },
  transpilePackages: ["@app/tools", "@app/auth", "@app/telemetry"]
};

export default nextConfig;
