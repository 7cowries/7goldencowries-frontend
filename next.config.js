/** @type {import('next').NextConfig} */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sevengoldencowries-backend.onrender.com';

const CSP = [
  "default-src 'self';",
  "base-uri 'self'; form-action 'self';",
  "img-src 'self' data: blob: https://*;",
  "font-src 'self' data:;",
  "style-src 'self' 'unsafe-inline';",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io;",
  // allow outbound requests for analytics, prices, wallet bridges, and your backend
  "connect-src 'self' https://plausible.io https://api.coingecko.com " +
    "https://sevengoldencowries-backend.onrender.com " +
    "https://bridge.tonapi.io wss://bridge.tonapi.io " +
    "https://connect.tonhubapi.com wss://connect.tonhubapi.com;",
  "frame-src 'self' https://*.tonkeeper.com;"
].join(' ');

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
      { key: 'Content-Security-Policy', value: CSP }
    ];
    return [
      { source: '/(.*)', headers: security },
      { source: '/:all*(svg|png|jpg|jpeg|ico|gif|webp)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }
    ];
  },
};
