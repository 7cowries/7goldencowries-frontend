// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

const common = {
  target: "https://sevengoldencowries-backend.onrender.com",
  changeOrigin: true,
  secure: false,
  cookieDomainRewrite: "localhost",
  // Don't strip prefixes. We want /api/* and /auth/* to pass through as-is.
  onProxyReq(proxyReq, req) {
    proxyReq.setHeader("x-forwarded-host", req.headers.host || "localhost:3000");
  },
};

module.exports = function (app) {
  app.use("/api", createProxyMiddleware(common));
  app.use("/auth", createProxyMiddleware(common));
};
