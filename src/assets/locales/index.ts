import en from './en.json';
import zh from './zh.json';
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import languageDetector from 'i18next-browser-languagedetector';

i18next
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources: {
      en: {
        translation: {
          ...en,
        },
      },
      zh: {
        translation: {
          ...zh,
        },
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
