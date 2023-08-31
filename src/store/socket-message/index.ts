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
import { API_BASE_URL } from '@/apis/request';
import { resolveProtocol } from '@/utils';
import { ElementContent } from 'hast';
import { getFixedPageMsg } from './utils';
import { isEqual, omit } from 'lodash-es';

const USER_ID = 'Debugger';

interface SocketMessage {
  socket: SocketStore | null;
  consoleMsg: SpyConsole.DataItem[];
  networkMsg: SpyNetwork.RequestInfo[];
  systemMsg: SpySystem.DataItem[];
  connectMsg: string[];
  pageMsg: {
    html: String;
    tree: ElementContent[] | null;
    location: SpyPage.DataItem['location'] | null;
  };
  storageMsg: Record<
    SpyStorage.DataType,
    Record<string, Omit<SpyStorage.DataItem, 'type' | 'action'>>
  >;
  initSocket: (url: string) => void;
  clearRecord: (key: SpyMessage.MessageType) => void;
  refresh: (key: SpyMessage.MessageType) => void;
}

export const useSocketMessageStore = create<SocketMessage>((set, get) => ({
  socket: null,
  consoleMsg: [],
  networkMsg: [],
  systemMsg: [],
  connectMsg: [],
  pageMsg: {
    html: '',
    tree: null,
    location: null,
  },
  storageMsg: {
    local: {},
    session: {},
    cookie: {},
  },
  initSocket: (room: string) => {
    if (!room) return;
    const _socket = get().socket;
    if (_socket) return;

    const [, protocol] = resolveProtocol();
    const url = `${protocol}${API_BASE_URL}/api/v1/ws/room/join?address=${room}&userId=${USER_ID}`;

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
    socket.addListener('connect', (data: string) => {
      set(
        produce<SocketMessage>((state) => {
          state.connectMsg.push(data);
        }),
      );
    });
    socket.addListener('page', async (data: SpyPage.DataItem) => {
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
    socket.addListener('storage', (data: SpyStorage.DataItem) => {
      const { type, action, name, ...restData } = data;
      switch (action) {
        case 'get':
        case 'set':
          if (name) {
            const state = omit(get().storageMsg[type][name], 'id');
            const newState = omit({ name, ...restData }, 'id');
            const skipUpdate = isEqual(state, newState);
            if (skipUpdate) return;
            set(
              produce<SocketMessage>((state) => {
                state.storageMsg[type][name] = {
                  name,
                  ...restData,
                };
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
              delete state.storageMsg[type][name!];
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
