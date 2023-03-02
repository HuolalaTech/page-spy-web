export interface InitConfig {
  /**
   * The server base url.
   * - Create room: `${api}/room/create`
   * - Filter romm: `${api}/room/list`
   */
  api?: string;
  /**
   * String literal which group connections by.
   */
  project?: string;
}

export * as SpySocket from './lib/socket-event';
export * as SpyMessage from './lib/message-type';
export * as SpyAtom from './lib/atom';

export * as SpyConsole from './lib/console';
export * as SpySystem from './lib/system';
export * as SpyNetwork from './lib/network';
export * as SpyStorage from './lib/storage';
export * as SpyPage from './lib/page';
