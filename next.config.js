/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
  || 'https://sevengoldencowries-backend.onrender.com';

module.exports = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_BASE}/api/:path*` }];
  },
};
