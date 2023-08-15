/**
 * useEventListener('eventName', (evt: Event) => {
 *   // code...
 * }, { target })
 *
 * window.dispatch(new CustomEvent({
 *   type: 'eventName',
 *   detail: {
 *     // data...
 *   }
 * }))
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';

type Listener<T extends Event> = (e: T) => void;

export const useEventListener = (
  type: string,
  listener: Listener<Event>,
  options?: {
    target: EventTarget;
    capture: AddEventListenerOptions['capture'];
    passive: AddEventListenerOptions['passive'];
  },
) => {
  const { target = window, capture = false, passive = true } = options || {};
  const handler = useRef<Listener<Event>>();
  handler.current = listener;

  const fn = useCallback((evt: Event) => {
    if (!handler.current) return;
    handler.current(evt);
  }, []);

  useEffect(() => {
    target.addEventListener(type, fn, {
      capture,
      passive,
    });
    return () => {
      target.removeEventListener(type, fn);
    };
  }, [target, type, fn, capture, passive]);
};
