import type { SpyMessage, SpySocket } from '@huolala-tech/page-spy';
import { message, notification } from 'antd';
import i18n from '@/assets/locales';
import * as SERVER_MESSAGE_TYPE from './server-type';

const CLIENT_ID = 'Client';
const MESSAGE_TYPE: SpyMessage.MessageType[] = [
  'connect',
  'console',
  'system',
  'network',
  'page',
  'storage',
];

const getI18n = (key: string) => {
  const lang = i18n.resolvedLanguage;
  const res = i18n.getResource(lang, 'translation', key);
  return res || key;
};

export class SocketStore extends EventTarget {
  socket: WebSocket | null = null;
  socketUrl: string = '';
  timer: number | null = null;
  reconnectTimes = 3;
  socketConnection: SpySocket.Connection | null = null;
  clientConnection: SpySocket.Connection | null = null;
  listenerStore = new Map();
  // WebSocket connect status
  connectionStatus = false;
  // Don't try to reconnect if error occupied
  reconnectable = true;
  // To ensure that the SDK can retrive the message
  // index correctly which in cache queue, it's necessary
  // to store the latest message id and send to sdk when reconnect.
  latestId = '';

  constructor(url: string) {
    super();
    this.socketUrl = url;
    this.init();
  }

  init(isReconnect: boolean = false) {
    this.socket = new WebSocket(this.socketUrl);
    this.socket.addEventListener('open', () => {
      this.connectOnline();
      const { MESSAGE, BROADCAST, CONNECT, LEAVE, JOIN, ERROR, CLOSE, PING } =
        SERVER_MESSAGE_TYPE;
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
          case MESSAGE:
          case BROADCAST:
            this.latestId = content.data.data.id;
            if (
              type === MESSAGE &&
              content.to.address !== this.socketConnection?.address
            )
              return;
            this.dispatchEvents(content.data.type, content.data);
            break;
          // other message type like `join` / `close`, etc.
          case CONNECT:
            this.socketConnection = content.selfConnection;
            this.filterClient(content);
            this.disapatchConnectStatus();
            break;
          case LEAVE:
            this.handleNotification(content, 'leave');
            break;
          case JOIN:
            if (content.connection.userId === CLIENT_ID) {
              this.clientConnection = content.connection;
              this.getCacheQueueMessage();
              this.disapatchConnectStatus();
            }
            break;
          case ERROR:
            this.reconnectable = false;
            message.error(content.message);
            break;
          case CLOSE:
          case PING:
            break;
        }
      });
    });
    this.socket?.addEventListener('close', (e) => {
      this.connectOffline();
    });

    this.socket?.addEventListener('error', (e) => {
      this.reconnectable = false;
      this.connectOffline();
    });
  }

  connectOnline() {
    this.connectionStatus = true;
    this.reconnectTimes = 3;
    this.pingConnect();
    this.disapatchConnectStatus();
  }

  getCacheQueueMessage() {
    this.unicastMessage({
      type: 'debugger-online',
      data: {
        latestId: this.latestId,
      },
    });
  }

  connectOffline() {
    this.socket = null;
    this.connectionStatus = false;
    this.socketConnection = null;
    this.clearPing();
    this.disapatchConnectStatus();
    if (!this.reconnectable) {
      return;
    }
    this.tryReconnect();
  }

  disapatchConnectStatus() {
    this.dispatchEvent(
      new CustomEvent('connect-status', {
        detail: {
          client: this.clientConnection,
          debug: this.socketConnection,
        },
      }),
    );
  }

  tryReconnect() {
    if (this.reconnectTimes > 0) {
      this.reconnectTimes -= 1;
      this.init(true);
    } else {
      notification.warning({
        message: getI18n('socket.debug-fail'),
        description: getI18n('socket.debug-fail-desc'),
      });
    }
  }
  pingConnect() {
    this.timer = window.setInterval(() => {
      if (this.socket?.readyState !== WebSocket.OPEN) return;
      this.socket!.send(
        JSON.stringify({
          type: SERVER_MESSAGE_TYPE.PING,
          content: null,
        }),
      );
    }, 10000);
  }

  clearPing() {
    if (this.timer) {
      window.clearInterval(this.timer);
    }
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
      message.warning(getI18n('socket.client-not-found'));
      return;
    }
    if (!this.socket) {
      message.error(getI18n('socket.debug-offline'));
      return;
    }
    const msg = this.makeUnicastMessage(data);
    this.socket!.send(JSON.stringify(msg));
  }

  makeUnicastMessage(data: any) {
    return {
      type: SERVER_MESSAGE_TYPE.MESSAGE,
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
      this.getCacheQueueMessage();
    } else {
      message.warning(getI18n('socket.client-not-in-connection'));
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
        this.connectOffline();
      } else if (address === clientAddress) {
        this.clientConnection = null;
        this.disapatchConnectStatus();
        setTimeout(() => {
          if (!this.clientConnection) {
            // the message won't notify if the client reconnect successfully
            notification.warning({
              message: getI18n('socket.client-offline'),
              description: getI18n('socket.client-fail'),
            });
          }
        }, 3000);
      }
    }
  }
}
