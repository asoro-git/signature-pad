import type { NextConfig } from "next";
import nextI18NextConfig from "./next-i18next.config";

const { i18n } = nextI18NextConfig;
const nextConfig: NextConfig = {
    /* config options here */
    i18n,
    reactStrictMode: true,
    basePath: "/signpad",
    async redirects() {
        return [
            {
                // does not add /docs since basePath: false is set
                source: "/",
                destination: "http://sydneyot.com/signpad",
                basePath: false,
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
