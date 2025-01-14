import { useState } from 'react';
import { useEventListener } from './useEventListener';

export const useThreshold = (value = 768) => {
  const [threshold, setThreshold] = useState(window.innerWidth <= value);
  useEventListener('resize', () => {
    const result = window.innerWidth <= value;
    if (result !== threshold) {
      setThreshold(result);
    }
  });

  return threshold;
};
