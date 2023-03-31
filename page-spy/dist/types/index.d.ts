export interface InitConfig {
  /**
   * The server base url. For example, "example.com".
   * - Create room: `https://${api}/room/create`
   * - Filter room: `https://${api}/room/list`
   * - Join WebSocket room: `wss://${api}/ws/room/join`
   */
  api?: string;

  /**
   * Client host. Form example, "https://example.com".
   */
  clientOrigin?: string;
  /**
   * Project name, used for group connections
   */
  project?: string;
}

export * as SpyDevice from './lib/device';
export * as SpySocket from './lib/socket-event';
export * as SpyMessage from './lib/message-type';
export * as SpyAtom from './lib/atom';

export * as SpyConsole from './lib/console';
export * as SpySystem from './lib/system';
export * as SpyNetwork from './lib/network';
export * as SpyStorage from './lib/storage';
export * as SpyPage from './lib/page';

export default class PageSpy {}
