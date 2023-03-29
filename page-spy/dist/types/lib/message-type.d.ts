export type DataType =
  | 'connect'
  | 'console'
  | 'system'
  | 'network'
  | 'page'
  | 'storage';

/**
 * Interactive: some type which sended by developer and need to reply something
 */
export type InteractiveType =
  | 'debug'
  | 'refresh'
  | 'atom-detail'
  | `atom-detail-${string}`
  | 'atom-getter'
  | `atom-getter-${string}`
  | 'debugger-online';

export type MessageType = DataType | InteractiveType;

export interface MessageItem {
  role: 'client' | 'debugger';
  type: MessageType;
  data: any;
}
