import { useSidebarStore } from '@/store/doc-sidebar';
import {
  PropsWithChildren,
  TransitionStartFunction,
  createContext,
  useEffect,
  useMemo,
  useTransition,
} from 'react';

interface ContextType {
  inTransition: boolean;
  startTransition: TransitionStartFunction;
}

export const TransitionContext = createContext<ContextType>({
  inTransition: false,
  startTransition: () => {},
});

export const TransitionContextWrapper = ({
  children,
}: PropsWithChildren<unknown>) => {
  const [inTransition, startTransition] = useTransition();
  const { setShow } = useSidebarStore();
  const value = useMemo(
    () => ({ inTransition, startTransition }),
    [inTransition],
  );
  useEffect(() => {
    if (!inTransition) {
      setShow(false);
    }
  }, [inTransition, setShow]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
};
