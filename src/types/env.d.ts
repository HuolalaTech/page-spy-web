/// <reference types="vite/client" />

declare module '*.less';
declare module '*.png';

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
