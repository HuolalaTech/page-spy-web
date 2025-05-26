import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useUrlParam = () => {
  // DON'T USE useSearch OR URLSearchParams, it decodes the url value automatically
  const { search } = useLocation();
  const replayUrl = useMemo(() => {
    const url = search.split('?url=')?.[1];
    return url || '';
  }, [search]);
  return replayUrl;
};
