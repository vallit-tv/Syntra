import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Rewrites removed to allow vercel.json routes to take precedence in Production
  // Development proxying for localhost:5001 is now handled manually or via .env.local if needed
  // or we can restore dev-only rewrites if we are careful. 
  // Let's remove them to be SAFE and rely on vercel.json.
};

export default nextConfig;
