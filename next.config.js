/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      // Primary proxy: everything under /api/* goes to Render backend
      { source: '/api/:path*', destination: 'https://sevengoldencowries-backend.onrender.com/api/:path*' },

      // Legacy aliases (explicit; safe to keep)
      { source: '/api/user/me',              destination: 'https://sevengoldencowries-backend.onrender.com/api/me' },
      { source: '/api/user/quests',          destination: 'https://sevengoldencowries-backend.onrender.com/api/quests' },
      { source: '/api/user/leaderboard',     destination: 'https://sevengoldencowries-backend.onrender.com/api/leaderboard' },
      { source: '/api/v1/payments/status',   destination: 'https://sevengoldencowries-backend.onrender.com/api/payments/status' }
    ];
  }
};
module.exports = nextConfig;
