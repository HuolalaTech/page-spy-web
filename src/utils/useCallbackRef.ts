import { useRef, useCallback, RefCallback } from 'react';

/**
 * 
    const handler = useCallbackRef((node) => {
      if (!node) return;

      const fn = () => {
        // ...
      };
      node.addEventListener('click', fn);
      return () => {
        node.removeEventListener('click', fn);
      };
    });
 */

type RawCallback<T> = (node: T) => (() => void) | void;
export default function useCallbackRef<T extends Element>(raw: RawCallback<T>) {
  const cleanupRef = useRef<ReturnType<RawCallback<T>> | null>(null);
  const callback = useCallback<RefCallback<T>>(
    (node) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      if (node) {
        cleanupRef.current = raw(node);
      }
    },
    [raw],
  );

  return callback;
}
