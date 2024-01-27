import { throttle } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

export const useForceRender = () => {
  const [isUpdated, setUpdated] = useState(0);

  const forceRender = useCallback(() => {
    setUpdated((count) => count + 1);
  }, []);

  return {
    isUpdated,
    forceRender,
  };
};

export const useForceThrottleRender = () => {
  const { isUpdated, forceRender } = useForceRender();

  const throttleRender = useMemo(() => {
    return throttle(forceRender, 300, { leading: true, trailing: true });
  }, [forceRender]);

  return { isUpdated, throttleRender };
};
