/** @type {import('next').NextConfig} */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://sevengoldencowries-backend.onrender.com';

// Build a single CSP string (no newlines)
const CSP = [
  "default-src 'self' https: data:",
  "img-src 'self' https: data: blob:",
  "script-src 'self' https://plausible.io 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://sevengoldencowries-backend.onrender.com https://plausible.io https://api.coingecko.com https://bridge.tonapi.io wss://bridge.tonapi.io https://connect.tonhubapi.com wss://connect.tonhubapi.com https://config.ton.org",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests"
].join('; ');

module.exports = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_BASE}/api/:path*` }];
  },
  async headers() {
    const security = [
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: CSP },
    ];
    const staticCache = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
    ];
    return [
      { source: '/(.*)', headers: security },
      { source: '/:all*(svg|png|jpg|jpeg|ico|gif|webp)', headers: staticCache },
    ];
  },
};
