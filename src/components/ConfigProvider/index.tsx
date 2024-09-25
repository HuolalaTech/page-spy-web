import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

interface Config {
  offline: boolean;
}

const defaultConfig: Config = {
  offline: false,
};

const Context = createContext<Config>(defaultConfig);

export const ConfigProvider = ({
  children,
  ...props
}: PropsWithChildren<Partial<Config>>) => {
  const config = useMemo(
    () => ({
      ...defaultConfig,
      ...props,
    }),
    [props],
  );

  return <Context.Provider value={config}>{children}</Context.Provider>;
};

export const useConfig = () => useContext(Context);
