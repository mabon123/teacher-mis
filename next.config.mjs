// next.config.mjs

// REMOVE these problematic imports:
// import { sources } from "next/dist/compiled/webpack/webpack";
// import { headers } from "next/headers";

const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*", // This correctly applies headers to all API routes
        headers: [
          // Ensure this matches your frontend's exact origin.
          // Your console showed http://localhost:5173, not 5273.
          // IMPORTANT: Change to your deployed frontend URL in production (e.g., https://your-frontend.com)
          { key: "Access-Control-Allow-Origin", value: "http://localhost:5173" }, // <--- Corrected port to 5173

          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
        ]
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Keep this if you want to ignore ESLint warnings/errors during build
  eslint: {
    ignoreDuringBuilds: true 
  }
};

export default nextConfig;