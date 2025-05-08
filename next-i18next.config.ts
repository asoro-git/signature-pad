import type { UserConfig } from "next-i18next";

const nextI18NextConfig: UserConfig = {
    i18n: {
        locales: ["en", "vi", "zh", "zh-Hant"],
        defaultLocale: "en",
        localeDetection: false,
    },
};

export default nextI18NextConfig;
