// next.config.mjs
const BACKEND = process.env.BACKEND_BASE || "https://sevengoldencowries-backend.onrender.com";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
