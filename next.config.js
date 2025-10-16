/** @type {import('next').NextConfig} */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://sevengoldencowries-backend.onrender.com';

module.exports = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },

  // Proxy your API to the backend
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_BASE}/api/:path*` }];
  },

  // 👇 Send all www traffic to apex
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.7goldencowries.com' }],
        destination: 'https://7goldencowries.com/:path*',
        permanent: true,
      },
    ];
  },

  // Security + long cache for images/icons
  async headers() {
    const security = [
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    return [
      { source: '/(.*)', headers: security },
      {
        source: '/:all*(svg|png|jpg|jpeg|ico|gif|webp)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};
