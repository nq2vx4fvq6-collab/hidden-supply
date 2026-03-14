import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — no one can embed this site in an iframe
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from guessing content types
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Only send referrer to same origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down browser feature access
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Force HTTPS for 2 years
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Tell all crawlers/bots not to index, cache, or archive any page
  {
    key: "X-Robots-Tag",
    value: "noindex, noarchive, nosnippet, noodp, noimageindex",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
