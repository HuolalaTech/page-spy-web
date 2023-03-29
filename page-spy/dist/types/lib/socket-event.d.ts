import type { MessageItem } from './message-type';

export type EventType =
  | 'connect'
  | 'join'
  | 'leave'
  | 'close'
  | 'broadcast'
  | 'message'
  | 'error'
  | 'ping';

export interface Connection {
  address: string;
  userId: string;
  name: string;
}

interface EventConstructor<T extends EventType, C extends any> {
  type: T;
  content: C;
}

export type JoinEvent = EventConstructor<
  'join',
  {
    connection: Connection;
  }
>;
export type ConnectEvent = EventConstructor<
  'connect',
  {
    selfConnection: Connection;
    roomConnections: Connection[];
  }
>;
export type LeaveEvent = EventConstructor<
  'leave',
  {
    connection: Connection;
  }
>;
export type CloseEvent = EventConstructor<
  'close',
  {
    roomAddress: string;
    reason: string;
  }
>;
export type BrodcastEvent = EventConstructor<
  'broadcast',
  {
    data: MessageItem;
  }
>;
export type UnicastEvent = EventConstructor<
  'message',
  {
    data: MessageItem;
    from: Connection;
    to: Connection;
  }
>;
export type ErrorEvent = EventConstructor<
  'error',
  {
    code: string;
    message: string;
  }
>;
export type PingEvent = EventConstructor<'ping', any>;
export type ClientEvent = UnicastEvent | BrodcastEvent | PingEvent;
export type Event =
  | JoinEvent
  | ConnectEvent
  | LeaveEvent
  | CloseEvent
  | BrodcastEvent
  | UnicastEvent
  | ErrorEvent
  | PingEvent;
