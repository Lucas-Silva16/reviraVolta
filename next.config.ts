import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  output: process.env.VERCEL === '1' ? undefined : 'standalone',
  distDir: process.env.RV_INTEGRATION_TEST === '1' ? '.next-test' : '.next',
  turbopack: { root: process.cwd() },
  devIndicators: false,
  logging: false,
  experimental: { serverActions: { bodySizeLimit: '8kb' } },
};
export default config;
