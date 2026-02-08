/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true
  },
  transpilePackages: ["@app/tools", "@app/auth", "@app/telemetry"]
};

export default nextConfig;
