import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useDarkTheme = () => {
  const { pathname } = useLocation();
  const isDark = useMemo(() => {
    return ['/', '/docs'].includes(pathname);
  }, [pathname]);

  return isDark;
};
