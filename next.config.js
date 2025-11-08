/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // PRD: forward all /api/* calls to backend
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sevengoldencowries-backend.onrender.com';

    return [
      // Canonical API
      { source: '/api/:path*', destination: `${backend}/api/:path*` },

      // Legacy aliases (frontend-level), in case any hardcoded calls exist
      { source: '/api/user/me',           destination: `${backend}/api/me` },
      { source: '/api/user/quests',       destination: `${backend}/api/quests` },
      { source: '/api/user/leaderboard',  destination: `${backend}/api/leaderboard` },
      { source: '/api/v1/payments/status',destination: `${backend}/api/payments/status` },
    ];
  },
};

module.exports = nextConfig;
