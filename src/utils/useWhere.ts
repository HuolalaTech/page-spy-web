import { useLocation } from 'react-router-dom';

export const useWhere = () => {
  const { pathname } = useLocation();

  return {
    isHome: pathname === '/',
    isPageSpy: pathname.startsWith('/pagespy'),
    isOSpy: pathname.startsWith('/o-spy'),
  };
};
