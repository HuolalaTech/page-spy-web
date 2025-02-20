import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useDarkTheme = () => {
  const { pathname } = useLocation();
  const isDark = useMemo(() => {
    if (
      ['/', '/pagespy', '/o-spy'].some((i) => i === pathname) ||
      pathname.startsWith('/pagespy/docs')
    )
      return true;
    return false;
  }, [pathname]);

  return isDark;
};
