/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      // Main API rewrite to Render backend
      {
        source: '/api/:path*',
        destination: 'https://sevengoldencowries-backend.onrender.com/api/:path*',
      },

      // Legacy route compatibility
      {
        source: '/api/user/me',
        destination: 'https://sevengoldencowries-backend.onrender.com/api/me',
      },
    ];
  },
};

module.exports = nextConfig;
