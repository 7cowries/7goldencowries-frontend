/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.BACKEND_ORIGIN}/api/:path*` },
    ];
  },
};
module.exports = nextConfig;
