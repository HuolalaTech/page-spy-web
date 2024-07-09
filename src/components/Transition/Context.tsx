import {
  PropsWithChildren,
  TransitionStartFunction,
  createContext,
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
  const value = useMemo(
    () => ({ inTransition, startTransition }),
    [inTransition],
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
};
