export type MessageType =
  /**
   * Just message
   */
  | 'connect'
  | 'console'
  | 'system'
  | 'network'
  | 'page'
  | 'storage'
  /**
   * Interactive: some type which sended by developer and need to reply something
   */
  | 'debug'
  | 'refresh'
  | `atom-${string}`;

export type InteractiveType =
  | 'debug'
  | 'refresh'
  | 'atom-detail'
  | 'atom-getter';

export interface MessageItem {
  role: 'client' | 'debugger';
  type: MessageType;
  data: Record<string, any>;
}
