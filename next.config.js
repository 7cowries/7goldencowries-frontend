/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          'https://sevengoldencowries-backend.onrender.com/api/:path*'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
module.exports = nextConfig;
