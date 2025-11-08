/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do NOT set output:'export'
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: '/api/:path*',            destination: 'https://sevengoldencowries-backend.onrender.com/api/:path*' },
      { source: '/api/user/me',           destination: 'https://sevengoldencowries-backend.onrender.com/api/me' },
      { source: '/api/user/quests',       destination: 'https://sevengoldencowries-backend.onrender.com/api/quests' },
      { source: '/api/user/leaderboard',  destination: 'https://sevengoldencowries-backend.onrender.com/api/leaderboard' },
      { source: '/api/v1/payments/status',destination: 'https://sevengoldencowries-backend.onrender.com/api/payments/status' }
    ];
  },
};
module.exports = nextConfig;
