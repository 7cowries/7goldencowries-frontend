/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },

  async rewrites() {
    if (!API_BASE) return [];
    // Map /api/* on the site to your backend /api/* (keeps /v1/... etc.)
    return [
      { source: '/api/:path*', destination: `${API_BASE}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
