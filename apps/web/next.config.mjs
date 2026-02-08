/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
    turbopack: {
      root: __dirname + "/../.."
    }
  },
  transpilePackages: ["@app/tools", "@app/auth", "@app/telemetry"]
};

export default nextConfig;
