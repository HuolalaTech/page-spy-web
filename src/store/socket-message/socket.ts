import type { SpyMessage, SpySocket } from '@huolala-tech/page-spy';
import { message, notification } from 'antd';
import * as SERVER_MESSAGE_TYPE from './server-type';
import { getTranslation } from '@/assets/locales';
import { MessageInstance } from 'antd/es/message/interface';

const CLIENT_ID = 'Client';
const MESSAGE_TYPE: SpyMessage.MessageType[] = [
  'connect',
  'console',
  'system',
  'network',
  'page',
  'storage',
];
const ERROR_CODE = {
  Unknown: 'UnknownError',
  RoomNotFound: 'RoomNotFoundError',
  RoomClose: 'RoomCloseError',
  NetWorkTimeout: 'NetWorkTimeoutError',
  MessageContent: 'MessageContentError',
  Serve: 'ServeError',
};

export class SocketStore extends EventTarget {
  socket: WebSocket | null = null;
  socketUrl: string = '';
  timer: number | null = null;
  socketConnection: SpySocket.Connection | null = null;
  clientConnection: SpySocket.Connection | null = null;
  listenerStore = new Map();
  // WebSocket connect status
  connectionStatus = false;
  // Indicate whether need try to reconnect or not
  retryTimes = 0;
  maxTimes = 4;
  maxDelay = (1 << this.maxTimes) * 1000;
  reconnectable = true;
  // To ensure that the SDK can retrive the message
  // index correctly which in cache queue, it's necessary
  // to store the latest message id and send to sdk when reconnect.
  latestId = '';

  constructor(url: string) {
    super();
    this.socketUrl = url;
    this.init.bind(this);
    this.init();
  }

  init() {
    this.socket = new WebSocket(this.socketUrl);
    this.socket.addEventListener('open', () => {
      this.connectOnline();
      this.peelMessage();
    });
    this.socket.addEventListener('close', (e) => {
      this.connectOffline();
    });

    this.socket.addEventListener('error', (e) => {
      this.connectOffline();
    });
  }

  peelMessage() {
    if (this.socket) {
      const { MESSAGE, BROADCAST, CONNECT, LEAVE, JOIN, ERROR, CLOSE, PING } =
        SERVER_MESSAGE_TYPE;
      this.socket.addEventListener('message', (evt: MessageEvent) => {
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
            this.dispatchConnectStatus();
            break;
          case LEAVE:
            this.handleNotification(content, 'leave');
            break;
          case JOIN:
            if (content.connection.userId === CLIENT_ID) {
              this.clientConnection = content.connection;
              this.getCacheQueueMessage();
              this.dispatchConnectStatus();
            }
            break;
          case ERROR:
            this.handleErrorMessage(content.code);
            break;
          case CLOSE:
          case PING:
            break;
        }
      });
    }
  }

  handleErrorMessage(code: string) {
    let i18nKey = '';
    let messageType: keyof MessageInstance = 'warning';
    switch (code) {
      case ERROR_CODE.RoomClose:
      case ERROR_CODE.RoomNotFound:
        this.reconnectable = false;
        i18nKey = 'socket.room-not-found';
        messageType = 'error';
        break;
      case ERROR_CODE.NetWorkTimeout:
        i18nKey = 'socket.network-timeout';
        break;
      // keep quiet
      case ERROR_CODE.Serve:
        i18nKey = 'socket.server-down';
        break;
      case ERROR_CODE.Unknown:
      case ERROR_CODE.MessageContent:
        break;
    }
    if (i18nKey) {
      message.destroy(i18nKey);
      message[messageType]({
        content: getTranslation(i18nKey),
        key: i18nKey,
      });
    }
  }

  getCacheQueueMessage() {
    this.unicastMessage({
      type: 'debugger-online',
      data: {
        latestId: this.latestId,
      },
    });
  }

  connectOnline() {
    this.connectionStatus = true;
    this.pingConnect();
    this.dispatchConnectStatus();
  }

  connectOffline() {
    this.socket = null;
    this.connectionStatus = false;
    this.socketConnection = null;
    this.clearPing();
    this.dispatchConnectStatus();
    if (!this.reconnectable) {
      return;
    }
    this.tryReconnect();
  }

  dispatchConnectStatus() {
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
    if (this.retryTimes > this.maxTimes) {
      notification.warning({
        message: getTranslation('socket.reconnect-fail'),
        description: getTranslation('socket.reconnect-fail-desc'),
      });
    } else {
      const delay = Math.min(this.maxDelay, (1 << this.retryTimes) * 1000);
      this.retryTimes += 1;

      setTimeout(() => {
        this.init();
      }, delay);
    }
  }

  // Close socket manually
  close(code = 1000, reason = 'Close websocket') {
    if (this.socket) {
      this.reconnectable = false;
      this.socket.close(code, reason);
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

  unicastMessage(data: any) {
    if (!this.clientConnection) {
      message.warning(getTranslation('socket.client-not-found'));
      return;
    }
    if (!this.socket) {
      message.error(getTranslation('socket.debug-offline'));
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
      message.warning(getTranslation('socket.client-not-in-connection'));
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
        this.dispatchConnectStatus();
        setTimeout(() => {
          if (!this.clientConnection) {
            // the message won't notify if the client reconnect successfully
            notification.warning({
              message: getTranslation('socket.client-offline'),
              description: getTranslation('socket.client-fail'),
            });
          }
        }, 3000);
      }
    }
  }
}
