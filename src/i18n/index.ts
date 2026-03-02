import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ka from "./locales/ka.json";
import en from "./locales/en.json";

const savedLang = localStorage.getItem("tamada-lang") || "ka";

i18n.use(initReactI18next).init({
  resources: {
    ka: { translation: ka },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "ka",
  interpolation: { escapeValue: false },
});

export default i18n;
