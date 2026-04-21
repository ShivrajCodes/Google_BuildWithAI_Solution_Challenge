/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,  // required for static export — next/image won't work otherwise
  },
};

export default nextConfig;