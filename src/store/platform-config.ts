import { ReactComponent as StorageSvg } from '@/assets/image/storage.svg';
import { ReactComponent as CookieSvg } from '@/assets/image/cookie.svg';
import { ReactComponent as DatabaseSvg } from '@/assets/image/database.svg';
import { SpyClient, SpyStorage } from '@huolala-tech/page-spy-types';
import { FunctionComponent } from 'react';
import { useSocketMessageStore } from './socket-message';

export type StorageType = SpyStorage.DataType | 'AppStorage';

export const isBrowser = (browser: SpyDevice.Browser) => {
  return [
    'wechat',
    'qq',
    'uc',
    'baidu',
    'edge',
    'chrome',
    'firefox',
    'safari',
    'unknown',
  ].includes(browser);
};

export const isMiniProgram = (browser: SpyDevice.Browser) => {
  return browser.startsWith('mp-');
};

export const isUniAppNative = (browser: SpyDevice.Browser) => {
  return browser === 'uni-native';
};

export const isHarmonyApp = (browser: SpyDevice.Browser) => {
  return browser.startsWith('harmony');
};

export const STORAGE_TYPES: {
  name: StorageType | 'indexedDB';
  label: string;
  icon: FunctionComponent;
  visible: (browser: SpyDevice.Browser) => boolean;
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
];

export const useStorageTypes = () => {
  const clientInfo = useSocketMessageStore((state) => state.clientInfo);
  return STORAGE_TYPES.filter((s) => {
    return s.visible(clientInfo?.browser.type || 'unknown');
  });
};
