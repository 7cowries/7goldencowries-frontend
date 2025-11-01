// next.config.mjs
/** @type {import('next').NextConfig} */
const BACKEND_BASE =
  process.env.BACKEND_BASE ||
  "https://sevengoldencowries-backend.onrender.com";

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  async rewrites() {
    // Forward ALL /api/* calls to the Render backend
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_BASE}/api/:path*`,
      },
    ];
  },
  // make sure cookies can flow through the proxy
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Forwarded-Host", value: "7goldencowries.com" },
          { key: "X-Forwarded-Proto", value: "https" },
        ],
      },
    ];
  },
};

export default nextConfig;
