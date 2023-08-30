import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type langType = 'zh' | 'en';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<langType>('en');

  useEffect(() => {
    const { languages, resolvedLanguage } = i18n;
    const lng =
      resolvedLanguage && languages.includes(resolvedLanguage)
        ? resolvedLanguage
        : 'en';
    setLang(lng as langType);
  }, [i18n, i18n.languages, i18n.resolvedLanguage]);

  return [lang, setLang] as const;
};
