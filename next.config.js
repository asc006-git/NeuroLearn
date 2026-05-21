/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allow production builds to complete even if the project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
