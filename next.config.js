/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: false,
  webpack: (config, { isServer }) => {
    // Add WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Add module resolution for the ZK prover
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/zk-prover/pkg': require.resolve('./zk-prover/pkg'),
    };

    return config;
  },
};

module.exports = nextConfig;