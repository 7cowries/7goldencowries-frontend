/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // If you ever add TS, you can also opt out of TS build errors with:
  // typescript: { ignoreBuildErrors: true },
};
module.exports = nextConfig;
