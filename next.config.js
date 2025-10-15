/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_URL ||
    "";
  const hasApi = /^https?:\/\//.test(API_BASE);
  return hasApi ? [{ source: "/api/:path*", destination: `${API_BASE}/:path*` }] : [];
}/api/:path*` },
    ];
  },
};
module.exports = nextConfig;
