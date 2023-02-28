import { createElement, forwardRef, useEffect, useRef, useState } from 'react';
import type { ComponentType, Dispatch, SetStateAction, ReactNode } from 'react';

export class PopupInstance<I = any, O = any> {
  constructor(private update: Dispatch<SetStateAction<PProps<I, O>>>) {}
  /**
   * Popup the Modal and return a promise object that will be pendding until Modal closed.
   * @param {I} params Custom params that will pass to Modal component
   * @returns {Promise<>}
   */
  popup(params?: never): Promise<O>;
  popup(params: I): Promise<O>;
  popup(params?: I) {
    const task = new Promise<O>((resolve, reject) => {
      this.update({ visible: true, params, resolve, reject });
    });
    const update = () =>
      this.update((prev) => {
        return { ...prev, visible: false, resolve: () => {}, reject: () => {} };
      });
    task.then(update, update);
    return task;
  }
}

interface PProps<I, O> {
  visible: boolean;
  params?: I;
  resolve: (result: O) => void;
  reject: (error: any) => void;
}

interface EmptyObject {
  children?: ReactNode;
}

/**
 * To wrap a Modal component, PProps will be injected into the props,
 * wrapped comopnent can use ref as PopupInstance.
 * @param Component A Modal component
 * @see PProps
 * @see PopupInstance
 */
export const withPopup = <I = any, O = any, P = EmptyObject>(
  Component: ComponentType<P & PProps<I, O>>,
) => {
  return forwardRef<PopupInstance<I, O>, P>((props, ref) => {
    const [state, setState] = useState<PProps<I, O>>({
      visible: false,
      resolve: () => {},
      reject: () => {},
    });
    useEffect(() => {
      let died = false;
      const instance = new PopupInstance<I, O>((...args) => {
        if (died) return;
        setState(...args);
      });
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        Object(ref).current = instance;
      }
      return () => {
        died = true;
      };
    }, [ref]);
    return createElement(Component, { ...props, ...state });
  });
};

export function usePopupRef<I = any, O = any>() {
  return useRef<PopupInstance<I, O>>(null);
}
