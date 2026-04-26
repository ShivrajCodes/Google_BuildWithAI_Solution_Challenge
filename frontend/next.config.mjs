/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,  // required for static export — next/image won't work otherwise
  },
  // Proxy API requests to FastAPI backend during local development (npm run dev)
  // These rewrites are ignored in static export mode (production)
  async rewrites() {
    return [
      {
        source: "/check",
        destination: "http://localhost:8000/check",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;