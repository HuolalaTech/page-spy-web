/* eslint-disable no-case-declarations */
import { create } from 'zustand';
import { produce } from 'immer';
import { CUSTOM_EVENT, SocketStore } from './socket';
import {
  SpyConsole,
  SpyNetwork,
  SpySystem,
  SpyPage,
  SpyStorage,
  SpyDatabase,
} from '@huolala-tech/page-spy';
import { API_BASE_URL } from '@/apis/request';
import { resolveProtocol } from '@/utils';
import { ElementContent } from 'hast';
import { getFixedPageMsg } from './utils';
import { isEqual, omit } from 'lodash-es';
import * as MESSAGE_TYPE from './message-type';

const USER_ID = 'Debugger';

interface SocketMessage {
  socket: SocketStore | null;
  consoleMsg: SpyConsole.DataItem[];
  consoleMsgTypeFilter: string[];
  networkMsg: SpyNetwork.RequestInfo[];
  systemMsg: SpySystem.DataItem[];
  connectMsg: string[];
  pageMsg: {
    html: String;
    tree: ElementContent[] | null;
    location: SpyPage.DataItem['location'] | null;
  };
  storageMsg: Record<SpyStorage.DataType, SpyStorage.GetTypeDataItem['data']>;
  databaseMsg: {
    basicInfo: SpyDatabase.DBInfo[] | null;
    data: SpyDatabase.GetTypeDataItem | null;
  };
  initSocket: (url: string) => void;
  setConsoleMsgTypeFilter: (typeList: string[]) => void;
  clearRecord: (key: string) => void;
  refresh: (key: string) => void;
}

export const useSocketMessageStore = create<SocketMessage>((set, get) => ({
  socket: null,
  consoleMsg: [],
  consoleMsgTypeFilter: [],
  networkMsg: [],
  systemMsg: [],
  connectMsg: [],
  pageMsg: {
    html: '',
    tree: null,
    location: null,
  },
  storageMsg: {
    localStorage: [],
    sessionStorage: [],
    cookie: [],
  },
  databaseMsg: {
    basicInfo: null,
    data: null,
  },
  initSocket: (room: string) => {
    if (!room) return;
    const _socket = get().socket;
    if (_socket) return;

    const [, protocol] = resolveProtocol();
    const url = `${protocol}${API_BASE_URL}/api/v1/ws/room/join?address=${room}&userId=${USER_ID}`;

    const socket = new SocketStore(url);
    set({ socket });
    socket.addListener(MESSAGE_TYPE.CONSOLE, (data: SpyConsole.DataItem) => {
      set(
        produce<SocketMessage>((state) => {
          state.consoleMsg.push(data);
        }),
      );
    });
    socket.addListener(MESSAGE_TYPE.SYSTEM, (data: SpySystem.DataItem) => {
      set(
        produce<SocketMessage>((state) => {
          state.systemMsg.push(data);
        }),
      );
    });
    socket.addListener(MESSAGE_TYPE.NETWORK, (data: SpyNetwork.RequestInfo) => {
      const cache = get().networkMsg;
      // 整理 xhr 的消息
      const { id } = data;
      const index = cache.findIndex((item) => item.id === id);
      if (index !== -1) {
        set(
          produce((state) => {
            state.networkMsg.splice(index, 1, data);
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
    socket.addListener(MESSAGE_TYPE.CONNECT, (data: string) => {
      set(
        produce<SocketMessage>((state) => {
          state.connectMsg.push(data);
        }),
      );
    });
    socket.addListener(MESSAGE_TYPE.PAGE, async (data: SpyPage.DataItem) => {
      const { tree, html } = await getFixedPageMsg(
        data.html,
        data.location.href,
      );
      set(
        produce<SocketMessage>((state) => {
          state.pageMsg = {
            // eslint-disable-next-line no-new-wrappers
            html: new String(html),
            tree,
            location: data.location,
          };
        }),
      );
    });
    socket.addListener(MESSAGE_TYPE.STORAGE, (data: SpyStorage.DataItem) => {
      const { type, action } = data;
      switch (action) {
        case 'get':
          set(
            produce<SocketMessage>((state) => {
              state.storageMsg[type] = data.data;
            }),
          );
          break;
        case 'set':
          if (data.name) {
            set(
              produce<SocketMessage>((state) => {
                const result = omit(data, 'id', 'type', 'action');
                const cacheData = state.storageMsg[type];

                const index = cacheData.findIndex(
                  (i) => i.name === result.name,
                );
                if (index < 0) {
                  cacheData.push(result);
                  return;
                }
                const skipUpdate = isEqual(cacheData[index], result);
                if (skipUpdate) return;
                cacheData[index] = result;
              }),
            );
          }
          break;
        case 'clear':
          set(
            produce<SocketMessage>((state) => {
              state.storageMsg[type] = [];
            }),
          );
          break;
        case 'remove':
          set(
            produce<SocketMessage>((state) => {
              state.storageMsg[type] = state.storageMsg[type].filter(
                (i) => i.name !== data.name,
              );
            }),
          );
          break;
        default:
          break;
      }
    });
    socket.addListener(MESSAGE_TYPE.DATABASE, (data: SpyDatabase.DataItem) => {
      switch (data.action) {
        case 'get':
          set(
            produce<SocketMessage>((state) => {
              state.databaseMsg.data = data;
            }),
          );
          break;
        case 'basic':
          set(
            produce<SocketMessage>((state) => {
              state.databaseMsg.basicInfo = data.result;
            }),
          );
          break;
        case 'update':
          const cache = get().databaseMsg.data;
          if (!cache) return;
          const { database, store } = cache;
          if (database?.name === data.database && store?.name === data.store) {
            window.dispatchEvent(
              new CustomEvent(CUSTOM_EVENT.DatabaseStoreUpdated, {
                detail: {
                  database: data.database,
                  store: data.store,
                },
              }),
            );
          }
          break;
        case 'clear':
          set(
            produce<SocketMessage>((state) => {
              if (!state.databaseMsg.data) return;
              const { database, store } = state.databaseMsg.data;
              if (
                database?.name === data.database &&
                store?.name === data.store
              ) {
                state.databaseMsg.data = null;
              }
            }),
          );
          break;
        case 'drop':
          set(
            produce<SocketMessage>((state) => {
              const { basicInfo, data: cache } = state.databaseMsg;
              if (basicInfo) {
                state.databaseMsg.basicInfo = basicInfo.filter(
                  (i) => i.name !== data.database,
                );
              }
              if (cache?.database?.name === data.database) {
                state.databaseMsg.data = null;
              }
            }),
          );
          break;
      }
    });
  },
  setConsoleMsgTypeFilter: (typeList: string[]) => {
    set({ consoleMsgTypeFilter: typeList });
  },
  clearRecord: (key: string) => {
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
  refresh: (key: string) => {
    const socket = get().socket;
    if (!socket) return;
    socket.unicastMessage({
      type: 'refresh',
      data: key,
    });
  },
}));
