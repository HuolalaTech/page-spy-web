import type { SpyMessage, SpySocket } from '@huolala-tech/page-spy';
import { message, notification } from 'antd';

const CLIENT_ID = 'Client';
const MESSAGE_TYPE: SpyMessage.MessageType[] = [
  'connect',
  'console',
  'system',
  'network',
  'page',
  'storage',
];

export class SocketStore extends EventTarget {
  socket: WebSocket | null = null;
  timer: number | null = null;
  reconnectTimes = 3;
  socketConnection: SpySocket.Connection | null = null;
  clientConnection: SpySocket.Connection | null = null;
  listenerStore = new Map();

  constructor(url: string) {
    super();
    this.init(url);
  }

  init(url: string) {
    this.socket = new WebSocket(url);
    this.socket.addEventListener('open', () => {
      this.reconnectTimes = 3;
      this.keepConnect();
      this.socket!.addEventListener('message', (evt: MessageEvent) => {
        const { data } = evt;
        let result = null;
        try {
          result = JSON.parse(data);
        } catch (e) {
          result = data;
        }
        const { type, content } = result as SpySocket.Event;
        // eslint-disable-next-line default-case
        switch (type) {
          // some message types that front-end cares about and handled
          case 'message':
            this.dispatchEvents(content.data.type, content.data);
            break;
          case 'send':
            if (content.to.address !== this.socketConnection?.address) return;
            this.dispatchEvents(content.data.type, content.data);
            break;
          // other message type like `join` / `close`, etc.
          case 'connect':
            this.filterClient(content);
            break;
          case 'leave':
            this.handleNotification(content, 'leave');
            break;
          case 'join':
            if (content.connection.userId === CLIENT_ID) {
              this.clientConnection = content.connection;
            } else if (!this.socketConnection) {
              this.socketConnection = content.connection;
            }
            break;
          case 'error':
            message.error(content.message);
            break;
          case 'close':
          case 'ping':
            break;
        }
      });
    });
    ['close', 'error'].forEach((i) => {
      this.socket?.addEventListener(i, () => {
        this.socketConnection = null;
        if (this.timer) {
          window.clearInterval(this.timer);
        }
        this.tryReconnect();
      });
    });
  }

  tryReconnect() {
    if (this.reconnectTimes > 0) {
      this.reconnectTimes -= 1;
      if (this.socket!.readyState !== WebSocket.OPEN) {
        setTimeout(() => {
          this.init(this.socket!.url);
        }, 3000);
      }
    } else {
      this.socket = null;
      if (this.timer) {
        window.clearInterval(this.timer);
      }
      notification.warning({
        message: 'Connection closed',
        description: 'Reconnect failed, you have losed connection.',
        duration: 0,
      });
    }
  }
  keepConnect() {
    this.timer = window.setInterval(() => {
      if (this.socket?.readyState !== WebSocket.OPEN) return;
      this.socket!.send(
        JSON.stringify({
          type: 'ping',
          content: null,
        }),
      );
    }, 10000);
  }
  dispatchEvents(type: SpyMessage.MessageType, data: SpyMessage.MessageItem) {
    if (MESSAGE_TYPE.indexOf(type) === -1 && /^atom-.*$/.test(type) === false)
      return;
    if (!data.role || data.role !== 'client') return;

    if (MESSAGE_TYPE.indexOf(type) !== -1) {
      window.dispatchEvent(
        new CustomEvent('page-spy-updated', {
          detail: type,
        }),
      );
    }

    this.dispatchEvent(
      new CustomEvent(type, {
        detail: data.data,
      }),
    );
  }

  addListener(type: SpyMessage.MessageType, fn: (data: any) => void) {
    const callback = (evt: any) => {
      const { detail } = evt;
      fn.call(this, detail);
    };
    this.listenerStore.set(type, callback);
    this.addEventListener(type, callback);
  }

  removeListener(type: SpyMessage.MessageType) {
    const callback = this.listenerStore.get(type);
    if (callback) {
      this.listenerStore.delete(type);
      this.removeEventListener(type, callback);
    }
  }

  close(code = 1000, reason = 'Close websocket') {
    if (this.timer) {
      window.clearInterval(this.timer);
    }
    if (this.socket) {
      this.socket.close(code, reason);
    }
  }

  unicastMessage(data: any) {
    if (!this.clientConnection) {
      message.warning('Client not found');
      return;
    }
    if (!this.socket) {
      message.error('Connection closed');
      return;
    }
    const msg = this.makeUnicastMessage(data);
    this.socket!.send(JSON.stringify(msg));
  }

  makeUnicastMessage(data: any) {
    return {
      type: 'send',
      content: {
        data,
        from: this.socketConnection,
        to: this.clientConnection,
      },
    };
  }
  filterClient(data: SpySocket.ConnectEvent['content']) {
    const client = data.roomConnections.find(
      (item) => item.userId === CLIENT_ID,
    );
    if (client) {
      this.clientConnection = client;
    } else {
      message.warning('No client in the current room');
    }
  }
  handleNotification(
    content: SpySocket.LeaveEvent['content'],
    evtType: 'join' | 'leave',
  ) {
    const { address } = content.connection;
    const { address: socketAddress } = this.socketConnection || {};
    const { address: clientAddress } = this.clientConnection || {};
    if (evtType === 'leave') {
      if (address === socketAddress) {
        this.socketConnection = null;
        this.tryReconnect();
      } else if (address === clientAddress) {
        this.clientConnection = null;
        setTimeout(() => {
          if (!this.clientConnection) {
            notification.warning({
              message: 'Connection closed',
              description: 'The client connection has closed.',
              duration: 0,
            });
          }
        }, 3000);
      }
    }
  }
}
