/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tempora/db", "@tempora/types"],
  serverExternalPackages: ["@prisma/client"],
};

module.exports = nextConfig;
