// next.config.js
/** @type {import('next').NextConfig} */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  process.env.BACKEND_ORIGIN ||
  'https://sevengoldencowries-backend.onrender.com';

function safeOrigin(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch (err) {
    return '';
  }
}

const API_ORIGIN =
  safeOrigin(API_BASE) || 'https://sevengoldencowries-backend.onrender.com';

// Build a single CSP string (no newlines)
const CSP = [
  "default-src 'self' https: data:",
  "img-src 'self' https: data: blob:",
  "script-src 'self' https://plausible.io 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${API_ORIGIN} https://plausible.io https://api.coingecko.com https://bridge.tonapi.io wss://bridge.tonapi.io https://connect.tonhubapi.com wss://connect.tonhubapi.com https://config.ton.org`,
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_BASE}/api/:path*` },
      { source: '/ref/:path*', destination: `${API_BASE}/ref/:path*` },
    ];
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
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ];
    const apiNoStore = [{ key: 'Cache-Control', value: 'no-store' }];

    return [
      { source: '/(.*)', headers: security },
      { source: '/api/:path*', headers: apiNoStore },
      { source: '/ref/:path*', headers: apiNoStore },
      { source: '/:all*(svg|png|jpg|jpeg|ico|gif|webp)', headers: staticCache },
    ];
  },
};

module.exports = nextConfig;
