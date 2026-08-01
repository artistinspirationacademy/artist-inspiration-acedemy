import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        remotePatterns: [
            new URL("https://b09x48qgzv.ufs.sh/f/*"),
            new URL("https://q3kifue2qs.ufs.sh/f/*"),
        ],
    },
    experimental: {
        proxyClientMaxBodySize: "200mb",
        optimizePackageImports: ["@phosphor-icons/react"],
    },
};

export default nextConfig;
