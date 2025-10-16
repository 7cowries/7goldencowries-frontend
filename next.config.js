/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    if (!API_BASE) return [];
    return [{ source: '/api/:path*', destination: `${API_BASE}/api/:path*` }];
  },
};
module.exports = nextConfig;
