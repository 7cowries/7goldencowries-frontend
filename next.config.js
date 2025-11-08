/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      // Proxy ALL API calls to the backend
      { source: '/api/:path*', destination: 'https://sevengoldencowries-backend.onrender.com/api/:path*' },

      // Legacy aliases (frontend level) that some code still hits
      { source: '/api/user/me',          destination: 'https://sevengoldencowries-backend.onrender.com/api/me' },
      { source: '/api/user/quests',      destination: 'https://sevengoldencowries-backend.onrender.com/api/quests' },
      { source: '/api/user/leaderboard', destination: 'https://sevengoldencowries-backend.onrender.com/api/leaderboard' },
      { source: '/api/v1/payments/status', destination: 'https://sevengoldencowries-backend.onrender.com/api/payments/status' }
    ];
  },
};
module.exports = nextConfig;
