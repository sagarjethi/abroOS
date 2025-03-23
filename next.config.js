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
      syncWebAssembly: true,
    };

    // Ensure WASM files are properly bundled and accessible
    config.output = {
      ...config.output,
      webassemblyModuleFilename: 'static/wasm/[modulehash].wasm'
    };

    // Add rule to handle WASM files
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.wasm$/,
          type: 'webassembly/async',
        },
      ],
    };

    // Add module resolution for the ZK prover
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/zk-prover/pkg': require.resolve('./zk-prover/pkg'),
    };

    return config;
  },
  // Add environment variables to be available at build time
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.0.1',
    NEXT_PUBLIC_IS_DEMO_MODE: 'true', // Set to true for demo purposes
  },
};

module.exports = nextConfig;