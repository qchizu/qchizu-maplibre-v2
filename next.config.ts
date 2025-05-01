import type { NextConfig } from "next";

const isPreview = process.env.IS_PREVIEW === "true";
const prNumber = process.env.PR_NUMBER;
const basePath = isPreview ? `/pr-preview-${prNumber}` : process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
    output: "export",
    basePath: basePath,
    assetPrefix: isPreview ? `${basePath}/` : undefined,
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
    },
};

export default nextConfig;
