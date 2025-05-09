"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const locales = [
    { code: "en", label: "English" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "zh", label: "简体中文" },
    { code: "zh-Hant", label: "繁體中文" },
];

export default function LanguageButtons() {
    const { t, i18n } = useTranslation("common");

    return (
        <div role="group" aria-label={t("Select language")} className="grid grid-cols-4 gap-2">
            {locales.map(({ code, label }) => (
                <button
                    key={code}
                    onClick={() => i18n.changeLanguage(code)}
                    className={`
            px-4 py-2 rounded-md w-full break-words xl:col-span-1 col-span-2 font-medium transition
            ${
                i18n.language === code
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }
          `}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
