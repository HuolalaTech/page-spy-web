import { isCN } from '@/assets/locales';
import OSpy from '@huolala-tech/page-spy-plugin-ospy';
import '@huolala-tech/page-spy-plugin-ospy/dist/index.css';
import { useEffect } from 'react';

export const CallOSpy = () => {
  useEffect(() => {
    const $oSpy = new OSpy({
      lang: isCN() ? 'zh' : 'en',
    });
    return () => {
      $oSpy.abort();
    };
  }, []);
  return null;
};
