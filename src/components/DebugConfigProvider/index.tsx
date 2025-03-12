import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

interface DebugConfig {
  offline: boolean;
}

const defaultConfig: DebugConfig = {
  offline: false,
};

const DebugConfigContext = createContext<DebugConfig>(defaultConfig);

export const DebugConfigProvider = ({
  children,
  ...props
}: PropsWithChildren<Partial<DebugConfig>>) => {
  const config = useMemo(
    () => ({
      ...defaultConfig,
      ...props,
    }),
    [props],
  );

  return (
    <DebugConfigContext.Provider value={config}>
      {children}
    </DebugConfigContext.Provider>
  );
};

export const useDebugConfig = () => useContext(DebugConfigContext);
