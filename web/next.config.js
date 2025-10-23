/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations for Vercel
  reactStrictMode: true,

  // Performance optimizations
  swcMinify: true,
  compress: true,

  // Static file serving
  trailingSlash: false,

  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Build optimizations
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Vercel-specific optimizations
  experimental: {
    // optimizeCss: true, // Disabled due to critters dependency issue
  },

  // Disable PostCSS processing to avoid Tailwind CSS module resolution errors
  webpack: (config, { isServer }) => {
    // Remove PostCSS loader
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOf) => {
          if (oneOf.use && Array.isArray(oneOf.use)) {
            oneOf.use = oneOf.use.filter((use) => {
              return !(typeof use === 'object' && use.loader && use.loader.includes('postcss-loader'));
            });
          }
        });
      }
    });
    return config;
  },

  // Static exports for better performance
  // output: 'standalone', // Disabled for Vercel compatibility

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/styles/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/scripts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;