import { create } from 'zustand';
import { produce } from 'immer';
import { SocketStore } from './socket';
import {
  SpyConsole,
  SpyNetwork,
  SpySystem,
  SpyPage,
  SpyStorage,
  SpyMessage,
} from '@huolala-tech/page-spy';

interface SocketMessage {
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

export const useSocketMessageStore = create<SocketMessage>((set, get) => ({
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
  initSocket: (url: string) => {
    const socket = new SocketStore(url);
    set({ socket });
    socket.addListener('console', (data: SpyConsole.DataItem) => {
      set(
        produce<SocketMessage>((state) => {
          state.consoleMsg.push(data);
        }),
      );
    });
    socket.addListener('system', (data: SpySystem.DataItem) => {
      set(
        produce<SocketMessage>((state) => {
          state.systemMsg.push(data);
        }),
      );
    });
    socket.addListener('network', (data: SpyNetwork.RequestInfo) => {
      const cache = get().networkMsg;
      // 整理 xhr 的消息
      const { id } = data;
      const index = cache.findIndex((item) => item.id === id);
      if (index !== -1) {
        set(
          produce((state) => {
            state.splice(index, 1, data);
          }),
        );
      } else {
        set(
          produce<SocketMessage>((state) => {
            state.networkMsg = produce(state.networkMsg, (draft) => {
              draft.push(data);
              return draft.sort((a, b) => a.startTime - b.startTime);
            });
          }),
        );
      }
    });
    socket.addListener('connect', (data: string) => {
      set(
        produce((state) => {
          state.connectMsg.push(data);
        }),
      );
    });
    socket.addListener('page', (data: SpyPage.DataItem) => {
      set(
        produce((state) => {
          state.pageMsg = [data];
        }),
      );
    });
    socket.addListener('storage', (data: SpyStorage.DataItem) => {
      const cache = get().storageMsg;
      const { type, action, key, value } = data;
      switch (action) {
        case 'get':
        case 'set':
          if (key && value) {
            set(
              produce<SocketMessage>((state) => {
                state.storageMsg[type][key] = value;
              }),
            );
          }
          break;
        case 'clear':
          set(
            produce<SocketMessage>((state) => {
              state.storageMsg[type] = {};
            }),
          );
          break;
        case 'remove':
          set(
            produce<SocketMessage>((state) => {
              delete state.storageMsg[type][key!];
            }),
          );
          break;
        default:
          break;
      }
    });
  },
  clearRecord: (key: SpyMessage.MessageType) => {
    switch (key) {
      case 'console':
        set({ consoleMsg: [] });
        break;
      case 'network':
        set({ networkMsg: [] });
        break;
      default:
        break;
    }
  },
  refresh: (key: SpyMessage.MessageType) => {
    const socket = get().socket;
    if (!socket) return;
    socket.unicastMessage({
      type: 'refresh',
      data: key,
    });
  },
}));

export const useConsoleStore = () => {
  const state = useSocketMessageStore((state) => state.consoleMsg);
  return state;
};
