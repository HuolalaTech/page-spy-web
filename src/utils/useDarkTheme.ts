import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useDarkTheme = () => {
  const { pathname } = useLocation();
  const isDark = useMemo(() => {
    if (
      pathname === '/' ||
      ['/docs', '/replay-lab'].some((i) => pathname.startsWith(i))
    )
      return true;
    return false;
  }, [pathname]);

  return isDark;
};
