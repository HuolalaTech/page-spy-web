import { initReactI18next } from 'react-i18next';
import i18next, { InitOptions } from 'i18next';
import languageDetector from 'i18next-browser-languagedetector';

const data = import.meta.glob('./*.json', { eager: true }) as Record<
  string,
  object
>;

const resources = Object.entries(data).reduce((acc, cur) => {
  const [key, value] = cur;
  const result = key.match(/^\.\/(.*)\.json$/);
  if (!result) return acc;
  acc[result[1]] = {
    translation: {
      ...value,
    },
  };
  return acc;
}, {} as NonNullable<InitOptions['resources']>);

i18next
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const getTranslation = (key: string) => {
  const lang = i18next.resolvedLanguage || 'en';
  const res = i18next.getResource(lang, 'translation', key);
  return res || key;
};

export const isCN = () => {
  const lang = i18next.resolvedLanguage;
  return ['zh', 'zh-CN', 'zh-Hans-CN'].some((l) => {
    return lang === l;
  });
};

export default i18next;
