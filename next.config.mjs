const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Disable font optimization since we're only using API routes
  optimizeFonts: false,
}

export default nextConfig