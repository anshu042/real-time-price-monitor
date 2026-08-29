/** @type {import('next').NextConfig} */

// Applied to every response. These are inexpensive defence-in-depth headers
// that do not alter rendering or appearance.
const securityHeaders = [
  // Stop MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow framing to prevent clickjacking.
  { key: "X-Frame-Options", value: "DENY" },
  // Send only the origin to third parties, and nothing on downgrade.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Drop access to device APIs this app never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS for a year once served over TLS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Restrict what legacy plugins/embeds may do.
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  // Do not advertise the framework version.
  poweredByHeader: false,

  // Next streams metadata for dynamic pages, which emits the tags after
  // </head>. Bots matching this pattern instead get blocking metadata
  // rendered inside <head>. Matching broadly keeps every crawler (and
  // Lighthouse/PageSpeed) on the in-head path.
  htmlLimitedBots: /.*/,

  // Emit smaller, cleaner production output.
  compress: true,
  reactStrictMode: true,

  compiler: {
    // Strip console output in production builds, keeping error/warn for
    // server-side diagnostics.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  experimental: {
    // Tree-shake large icon/chart barrel imports so only used modules ship.
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
