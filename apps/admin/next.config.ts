import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    experimental: {
        proxyClientMaxBodySize: "200mb",
        optimizePackageImports: ["@phosphor-icons/react"],
    },
};

export default nextConfig;
