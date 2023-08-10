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
}
