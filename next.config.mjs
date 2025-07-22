const nextConfig = {
  async rewrites() {
    return [
      { 
        source: '/complete_flow', 
        destination: 'https://aadityamishranuX-ai-trust-layer-backend.hf.space/complete_flow' 
      },
      { 
        source: '/process', 
        destination: 'https://aadityamishranuX-ai-trust-layer-backend.hf.space/process' 
      },
      { 
        source: '/health', 
        destination: 'https://aadityamishranuX-ai-trust-layer-backend.hf.space/health' 
      }
    ]
  },
  experimental: {
    proxyTimeout: 600000, // 10 minutes
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
export default nextConfig
