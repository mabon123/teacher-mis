const nextConfig = {
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