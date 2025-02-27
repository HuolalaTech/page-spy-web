import { useLocation } from 'react-router-dom';

export const useWhere = () => {
  const { pathname } = useLocation();

  return {
    isHome: pathname === '/',
    isDocs: pathname.startsWith('/docs'),
    isOSpy: pathname.startsWith('/o-spy'),
  };
};
