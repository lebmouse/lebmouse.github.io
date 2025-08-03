import type { NextConfig } from "next";
// import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/my-blog" : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  experimental: {
    serverComponentsHmrCache: false,
  },
};

// const withMDX = createMDX({
//   // Add markdown plugins here, as desired
//   extension: /\.(md|mdx)$/,
// });

// Merge MDX config with Next.js config
export default nextConfig;
