const nextConfig = {
  async rewrites() {
    // Use environment variable or fallback to HF Spaces
    const backendUrl = process.env.BACKEND_URL || 'https://aadityamishranuX-ai-trust-layer-backend.hf.space';
    
    return [
      { 
        source: '/complete_flow', 
        destination: `${backendUrl}/complete_flow` 
      },
      { 
        source: '/process', 
        destination: `${backendUrl}/process` 
      },
      { 
        source: '/health', 
        destination: `${backendUrl}/health` 
      }
    ]
  },
  experimental: {
    proxyTimeout: 600000, // 10 minutes for AI processing
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