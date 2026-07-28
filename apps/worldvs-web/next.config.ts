/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@worldvs/worldvs-api-client", "@worldvs/api-client-core", "@worldvs/api-contracts"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
