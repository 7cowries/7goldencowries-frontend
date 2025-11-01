/** @type {import('next').NextConfig} */
const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

const BACKEND_ORIGIN = isProd
  ? 'https://sevengoldencowries-backend.onrender.com'
  : 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

export default nextConfig;
