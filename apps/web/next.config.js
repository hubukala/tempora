/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tempora/db", "@tempora/types"],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

module.exports = nextConfig;
