/** @type {import('next').NextConfig} */
const BACKEND = process.env.BACKEND_ORIGIN || 'https://sevengoldencowries-backend.onrender.com';

const nextConfig = {
  reactStrictMode: false,

  // we let Vercel build even if ESLint/TS complains
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // keep the /api -> backend rewrite (what we added in the hotfix branch)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },

  // keep what the good prod commit did: widen connect-src so TonConnect works
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // same idea as 92f806f: allow https + wss for TonConnect
            value: "connect-src 'self' https: wss:;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
