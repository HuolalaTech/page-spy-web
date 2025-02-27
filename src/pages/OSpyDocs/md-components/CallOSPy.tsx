import OSpy from '@huolala-tech/page-spy-plugin-ospy';
import '@huolala-tech/page-spy-plugin-ospy/dist/index.css';
import { useEffect } from 'react';

export const CallOSpy = () => {
  useEffect(() => {
    const $oSpy = new OSpy();
    return () => {
      $oSpy.abort();
    };
  });
  return null;
};
