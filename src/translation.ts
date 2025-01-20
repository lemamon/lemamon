import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import XHR from "i18next-xhr-backend";

import translationEn from "./locales/en/translation.json";
import translationEs from "./locales/es/translation.json";
import translationPt from "./locales/pt-BR/translation.json";

i18n
  .use(XHR)
  .use(LanguageDetector)
  .init({
    debug: false,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translations: translationEn,
      },
      es: {
        translations: translationEs,
      },
      pt: {
        translations: translationPt,
      },
    },
    ns: ["translations"],
    defaultNS: "translations",
  });

export default i18n;
