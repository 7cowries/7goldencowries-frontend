/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
  || 'https://sevengoldencowries-backend.onrender.com';

const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  // IMPORTANT: do not use output: 'export'
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_BASE}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
