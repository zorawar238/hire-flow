import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['unpdf', 'pdf2json', 'pdf-parse'],
};

export default nextConfig;
