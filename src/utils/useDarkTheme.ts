import { useWhere } from './useWhere';

export const useDarkTheme = () => {
  const { isHome, isDocs, isOSpy } = useWhere();

  return isHome || isDocs || isOSpy;
};
