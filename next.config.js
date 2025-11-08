/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep builds green even if ESLint isn’t installed server-side
  eslint: { ignoreDuringBuilds: true },

  // IMPORTANT: do NOT set output: 'export' here.
  // Leaving it unset keeps the default serverful runtime so rewrites work on Vercel.

  async rewrites() {
    return [
      // Proxy ALL API calls to the Render backend
      { source: '/api/:path*', destination: 'https://sevengoldencowries-backend.onrender.com/api/:path*' },

      // Legacy aliases used by existing code
      { source: '/api/user/me',              destination: 'https://sevengoldencowries-backend.onrender.com/api/me' },
      { source: '/api/user/quests',          destination: 'https://sevengoldencowries-backend.onrender.com/api/quests' },
      { source: '/api/user/leaderboard',     destination: 'https://sevengoldencowries-backend.onrender.com/api/leaderboard' },
      { source: '/api/v1/payments/status',   destination: 'https://sevengoldencowries-backend.onrender.com/api/payments/status' }
    ];
  },
};
module.exports = nextConfig;
