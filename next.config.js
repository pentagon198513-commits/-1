/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repo = process.env.GH_PAGES_REPO || '';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isProd && repo ? `/${repo}` : '',
  assetPrefix: isProd && repo ? `/${repo}/` : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd && repo ? `/${repo}` : '',
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
