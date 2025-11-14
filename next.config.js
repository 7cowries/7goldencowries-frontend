// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // 🚨 IMPORTANT:
  // REMOVE ALL REWRITES THAT FORWARD /api → Vercel.
  // We now call the backend directly using API_BASE in src/utils/api.js.
};

module.exports = nextConfig;
