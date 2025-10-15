/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.BACKEND_ORIGIN}/api/:path*` },
    ];
  },
};
module.exports = nextConfig;
