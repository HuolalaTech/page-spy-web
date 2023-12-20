/// <reference types="vite/client" />

declare module '*.less';
declare module '*.png';

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_GITHUB_REPO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  sourceMap: typeof import('source-map');
  shiki: typeof import('shiki');
}

interface OptionName {
  name: string;
  /**
   * @default false
   */
  partitioned?: boolean;
  path?: string;
  url?: string;
}
interface CookieStoreValue {
  name: string;
  value: string;
  domain: null | string;
  path: string;
  partitioned: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  expires: null | number;
}
interface CookieStore extends EventTarget {
  delete: (name: OptionName | string) => Promise<void>;
  get: (name: OptionName | string) => Promise<null | CookieStoreValue>;
  getAll: () => Promise<CookieStoreValue[]>;
  set: ((name: string, value: string) => Promise<void>) &
    ((name: OptionName) => Promise<void>);
}
// eslint-disable-next-line no-var
declare const CookieStore: {
  prototype: CookieStore;
  new (): CookieStore;
};
declare const cookieStore: CookieStore;
