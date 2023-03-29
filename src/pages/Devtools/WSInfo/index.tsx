/* eslint-disable no-underscore-dangle */
import { API_BASE_URL } from '@/apis/request';
import type { PropsWithChildren } from 'react';
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { SocketStore } from './socket';
import type {
  SpyConsole,
  SpyMessage,
  SpyNetwork,
  SpyPage,
  SpyStorage,
  SpySystem,
} from '@huolala-tech/page-spy';
import { resolveProtocol } from '@/utils';

interface WSContextInfo {
  socket: SocketStore | null;
  consoleMsg: SpyConsole.DataItem[];
  networkMsg: SpyNetwork.RequestInfo[];
  systemMsg: SpySystem.DataItem[];
  connectMsg: string[];
  pageMsg: SpyPage.DataItem[];
  storageMsg: Record<SpyStorage.DataType, Record<string, string>>;
  clearRecord: (key: SpyMessage.MessageType) => void;
  refresh: (key: SpyMessage.MessageType) => void;
}

const WSContext = React.createContext<WSContextInfo>({
  socket: null,
  consoleMsg: [],
  networkMsg: [],
  systemMsg: [],
  connectMsg: [],
  pageMsg: [],
  storageMsg: {
    local: {},
    session: {},
    cookie: {},
  },
  clearRecord: () => {},
  refresh: () => {},
});

interface MessageCache {
  _console: WSContextInfo['consoleMsg'];
  _system: WSContextInfo['systemMsg'];
  _network: WSContextInfo['networkMsg'];
  _connect: WSContextInfo['connectMsg'];
  _page: WSContextInfo['pageMsg'];
  _storage: WSContextInfo['storageMsg'];
}

interface Props {
  room: string;
}

export const USER_ID = 'Developer';
export const WSProvider = ({ room, children }: PropsWithChildren<Props>) => {
  const messageRef = useRef<MessageCache>({
    _console: [],
    _system: [],
    _network: [],
    _connect: [],
    _page: [],
    _storage: {
      local: {},
      session: {},
      cookie: {},
    },
  });
  const [consoleMsg, setConsoleMsg] = useState<WSContextInfo['consoleMsg']>([]);
  const [systemMsg, setSystemMsg] = useState<WSContextInfo['systemMsg']>([]);
  const [networkMsg, setNetworkMsg] = useState<WSContextInfo['networkMsg']>([]);
  const [connectMsg, setConnectMsg] = useState<WSContextInfo['connectMsg']>([]);
  const [pageMsg, setPageMsg] = useState<WSContextInfo['pageMsg']>([]);
  const [storageMsg, setStorageMsg] = useState<WSContextInfo['storageMsg']>({
    local: {},
    session: {},
    cookie: {},
  });
  const [socket, setSocket] = useState<SocketStore | null>(null);

  useEffect(() => {
    if (!room || !!socket) return;
    const url = `${
      resolveProtocol()[1]
    }${API_BASE_URL}/api/v1/ws/room/join?address=${room}&userId=${USER_ID}`;
    const ws = new SocketStore(url);
    setSocket(ws);
  }, [room, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.addListener('console', (data: SpyConsole.DataItem) => {
      const { _console } = messageRef.current;
      _console.push(data);
      setConsoleMsg([..._console]);
    });
    socket.addListener('system', (data: SpySystem.DataItem) => {
      const { _system } = messageRef.current;
      _system.push(data);
      setSystemMsg([..._system]);
    });
    socket.addListener('network', (data: SpyNetwork.RequestInfo) => {
      const { _network } = messageRef.current;
      // 整理 xhr 的消息
      const { id } = data;
      const index = _network.findIndex((item) => item.id === id);
      if (index !== -1) {
        _network.splice(index, 1, data);
      } else {
        _network.push(data);
        messageRef.current._network = _network.sort(
          (a, b) => a.startTime - b.startTime,
        );
      }
      setNetworkMsg([..._network]);
    });
    socket.addListener('connect', (data: string) => {
      const { _connect } = messageRef.current;
      _connect.push(data);
      setConnectMsg([..._connect]);
    });
    socket.addListener('page', (data: SpyPage.DataItem) => {
      messageRef.current._page = [data];
      setPageMsg([data]);
    });
    socket.addListener('storage', (data: SpyStorage.DataItem) => {
      const { _storage } = messageRef.current;
      const { type, action, key, value } = data;
      switch (action) {
        case 'get':
        case 'set':
          if (key && value) {
            _storage[type][key] = value;
          }
          break;
        case 'clear':
          _storage[type] = {};
          break;
        case 'remove':
          delete _storage[type][key!];
          break;
        default:
          break;
      }
      setStorageMsg({
        ..._storage,
      });
    });
    // eslint-disable-next-line consistent-return
    return () => {
      socket.close();
    };
  }, [socket]);

  const clearRecord = useCallback((key: SpyMessage.MessageType) => {
    switch (key) {
      case 'console':
        messageRef.current._console = [];
        setConsoleMsg([]);
        break;
      case 'network':
        messageRef.current._network = [];
        setNetworkMsg([]);
        break;
      default:
        break;
    }
  }, []);

  const refresh = useCallback(
    (key: SpyMessage.MessageType) => {
      socket?.unicastMessage({
        type: 'refresh',
        data: key,
      });
    },
    [socket],
  );

  return (
    <WSContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        socket,
        consoleMsg,
        networkMsg,
        systemMsg,
        connectMsg,
        pageMsg,
        storageMsg,
        clearRecord,
        refresh,
      }}
    >
      {children}
    </WSContext.Provider>
  );
};

export function useWSInfo() {
  const value = useContext(WSContext);
  return value;
}
