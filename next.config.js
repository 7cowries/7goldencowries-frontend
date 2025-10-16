/** @type {import('next').NextConfig} */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://sevengoldencowries-backend.onrender.com';

const CSP = [
  "default-src 'self' https: data:",
  "img-src 'self' https: data:",
  "script-src 'self' https://plausible.io 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://sevengoldencowries-backend.onrender.com https://plausible.io",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests"
].join('; ');

module.exports = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_BASE}/api/:path*` }];
  },
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
  async headers() {
    const security = [
      { key: 'Content-Security-Policy', value: CSP },
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
