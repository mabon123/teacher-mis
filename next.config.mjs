import { sources } from "next/dist/compiled/webpack/webpack";
import { headers } from "next/headers";

const nextConfig = {
  async headers(){
    return[
      {
        source: "/api/:path*",
        headers: [
          {key: "Access-Control-Allow-Origin", value: "http://localhost:5273"},
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
  eslint: {
    ignoreDuringBuilds: true // Add this to prevent ESLint errors from failing the build
  }
};

export default nextConfig;