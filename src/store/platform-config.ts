import { ReactComponent as StorageSvg } from '@/assets/image/storage.svg';
import { ReactComponent as CookieSvg } from '@/assets/image/cookie.svg';
import { ReactComponent as DatabaseSvg } from '@/assets/image/database.svg';
import { SpyClient, SpyStorage } from '@huolala-tech/page-spy-types';
import { FunctionComponent } from 'react';
import { useSocketMessageStore } from './socket-message';
import { AllBrowserTypes } from '@/utils/brand';

export type StorageType = SpyStorage.DataType | 'AppStorage';

export const isBrowser = (browser: SpyClient.Browser) => {
  return AllBrowserTypes.includes(browser);
};

export const isMiniProgram = (browser: SpyClient.Browser) => {
  return browser.startsWith('mp-');
};

export const isUniAppNative = (browser: SpyClient.Browser) => {
  return browser === 'uni-native';
};

export const isHarmonyApp = (browser: SpyClient.Browser) => {
  return browser === 'harmony';
};

export const isReactNative = (browser: SpyClient.Browser) => {
  return browser === 'react-native';
};

export const STORAGE_TYPES: {
  name: StorageType | 'indexedDB';
  label: string;
  icon: FunctionComponent;
  visible: (browser: SpyClient.Browser) => boolean;
}[] = [
  {
    name: 'localStorage',
    label: 'Local Storage',
    icon: StorageSvg,
    visible: isBrowser,
  },
  {
    name: 'sessionStorage',
    label: 'Session Storage',
    icon: StorageSvg,
    visible: isBrowser,
  },
  {
    name: 'cookie',
    label: 'Cookies',
    icon: CookieSvg,
    visible: isBrowser,
  },
  {
    name: 'indexedDB',
    label: 'IndexedDB',
    icon: DatabaseSvg,
    visible: isBrowser,
  },
  {
    name: 'mpStorage',
    label: '小程序 Storage',
    icon: StorageSvg,
    visible: (browser) => {
      return isMiniProgram(browser) || isUniAppNative(browser);
    },
  },
  {
    name: 'AppStorage',
    label: 'AppStorage',
    icon: StorageSvg,
    visible: isHarmonyApp,
  },
  {
    name: 'asyncStorage',
    label: 'Async Storage',
    icon: StorageSvg,
    visible: isReactNative,
  },
];

export const useStorageTypes = () => {
  const clientInfo = useSocketMessageStore((state) => state.clientInfo);
  return STORAGE_TYPES.filter((s) => {
    return s.visible(clientInfo?.browser.type || 'unknown');
  });
};
