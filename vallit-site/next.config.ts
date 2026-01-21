import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:5001/api/:path*', // Proxy to Flask server
        },
        {
          source: '/widget/:path*',
          destination: 'http://127.0.0.1:5001/widget/:path*', // Proxy widget scripts
        },
        {
          source: '/static/:path*',
          destination: 'http://127.0.0.1:5001/static/:path*', // Proxy static files
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
