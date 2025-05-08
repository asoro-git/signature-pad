// lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// make sure you have `resolveJsonModule: true` in your tsconfig
import en from "../locales/en/common.json";
import vi from "../locales/vi/common.json";
import zh from "../locales/zh/common.json";
import zhHant from "../locales/zh-Hant/common.json";

const resources = {
    en: { common: en },
    vi: { common: vi },
    zh: { common: zh },
    "zh-Hant": { common: zhHant },
};

if (!i18n.isInitialized) {
    i18n.use(LanguageDetector) // auto-detect user’s language
        .use(initReactI18next) // hook into React
        .init({
            resources,
            fallbackLng: "en",
            supportedLngs: ["en", "vi", "zh", "zh-Hant"],
            ns: ["common"],
            defaultNS: "common",
            interpolation: { escapeValue: false },
            detection: {
                order: ["querystring", "cookie", "localStorage", "navigator"],
                caches: ["cookie", "localStorage"],
            },
        });
}

export default i18n;
