import {
  SpyConsole,
  SpyMessage,
  SpyNetwork,
  SpyStorage,
  SpySystem,
} from '@huolala-tech/page-spy-types';
import { create } from 'zustand';
import { eventWithTime } from '@rrweb/types';
import { produce } from 'immer';
import { isEqual, omit } from 'lodash-es';

export interface HarborDataItem<T = any> {
  type: SpyMessage.DataType | 'rrweb-event';
  timestamp: number;
  data: T;
}

export interface ReplayStore {
  allConsoleMsg: HarborDataItem[];
  allNetworkMsg: HarborDataItem[];
  allRRwebEvent: eventWithTime[];
  allStorageMsg: HarborDataItem<SpyStorage.DataItem>[];
  allSystemMsg: SpySystem.DataItem[];
  startTime: number;
  endTime: number;
  duration: number;
  consoleMsg: SpyConsole.DataItem[];
  networkMsg: SpyNetwork.RequestInfo[];
  storageMsg: Record<SpyStorage.DataType, SpyStorage.GetTypeDataItem['data']>;
  setAllData: (data: HarborDataItem[]) => void;
  updateElapsed: (elapsed: number) => void;
  updateConsoleMsg: (currentTime: number) => void;
  updateNetworkMsg: (currentTime: number) => void;
  updateStorageMsg: (currentTime: number) => void;
  isExpand: boolean;
  setIsExpand: (expand: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
}

export const useReplayStore = create<ReplayStore>((set, get) => ({
  allConsoleMsg: [],
  allNetworkMsg: [],
  allRRwebEvent: [],
  allStorageMsg: [],
  allSystemMsg: [],
  startTime: 0,
  endTime: 0,
  duration: 0,
  consoleMsg: [],
  networkMsg: [],
  storageMsg: {
    localStorage: [],
    sessionStorage: [],
    cookie: [],
    // 'mpStorage' is just for type correct at now
    mpStorage: [],
  },
  setAllData: (data: HarborDataItem[]) => {
    if (!data?.length) return;

    const start = data[0].timestamp;
    const end = data[data.length - 1].timestamp;

    const result: Pick<
      ReplayStore,
      | 'allConsoleMsg'
      | 'allNetworkMsg'
      | 'allRRwebEvent'
      | 'allStorageMsg'
      | 'allSystemMsg'
    > = {
      allConsoleMsg: [],
      allNetworkMsg: [],
      allRRwebEvent: [],
      allStorageMsg: [],
      allSystemMsg: [],
    };
    const {
      allConsoleMsg,
      allNetworkMsg,
      allRRwebEvent,
      allSystemMsg,
      allStorageMsg,
    } = data.reduce((acc, cur) => {
      switch (cur.type) {
        case 'console':
          acc.allConsoleMsg.push(cur);
          break;
        case 'network':
          acc.allNetworkMsg.push(cur);
          break;
        case 'rrweb-event':
          acc.allRRwebEvent.push(cur.data);
          break;
        case 'storage':
          acc.allStorageMsg.push(cur);
          break;
        case 'system':
          acc.allSystemMsg.push(cur.data);
          break;
      }
      return acc;
    }, result);

    set(
      produce((state) => {
        state.allConsoleMsg = allConsoleMsg;
        state.allNetworkMsg = allNetworkMsg;
        state.allRRwebEvent = allRRwebEvent;
        state.allSystemMsg = allSystemMsg;
        state.allStorageMsg = allStorageMsg;
        state.startTime = start;
        state.endTime = end;
        state.duration = end - start;
      }),
    );
  },
  updateElapsed: (elapsed: number) => {
    const {
      allConsoleMsg,
      allNetworkMsg,
      allStorageMsg,
      startTime,
      endTime,
      updateConsoleMsg,
      updateNetworkMsg,
      updateStorageMsg,
    } = get();

    const currentTime = startTime + elapsed;
    if (currentTime <= startTime) {
      set(
        produce<ReplayStore>((state) => {
          state.consoleMsg = [];
          state.networkMsg = [];
          state.storageMsg = {
            localStorage: [],
            sessionStorage: [],
            cookie: [],
            mpStorage: [],
          };
        }),
      );
      return;
    }
    if (currentTime >= endTime) {
      set(
        produce((state) => {
          state.consoleMsg = allConsoleMsg.map((i) => i.data);
          state.networkMsg = allNetworkMsg.map((i) => i.data);
          updateStorageMsg(currentTime);
        }),
      );
      return;
    }
    updateConsoleMsg(currentTime);
    updateNetworkMsg(currentTime);
    updateStorageMsg(currentTime);
  },
  updateConsoleMsg(currentTime: number) {
    const { allConsoleMsg, consoleMsg } = get();

    let consoleIndex = 0;
    const showedConsoleMsg: SpyConsole.DataItem[] = [];
    while (
      consoleIndex < allConsoleMsg.length &&
      allConsoleMsg[consoleIndex].timestamp <= currentTime
    ) {
      showedConsoleMsg.push(allConsoleMsg[consoleIndex].data);
      consoleIndex += 1;
    }

    if (showedConsoleMsg.length !== consoleMsg.length) {
      set(
        produce((state) => {
          state.consoleMsg = showedConsoleMsg;
        }),
      );
    }
  },
  updateNetworkMsg(currentTime: number) {
    const { allNetworkMsg, networkMsg } = get();

    let networkIndex = 0;
    const showedNetworkMsg: SpyNetwork.RequestInfo[] = [];
    while (
      networkIndex < allNetworkMsg.length &&
      allNetworkMsg[networkIndex].timestamp <= currentTime
    ) {
      showedNetworkMsg.push(allNetworkMsg[networkIndex].data);
      networkIndex += 1;
    }

    if (showedNetworkMsg.length !== networkMsg.length) {
      set(
        produce((state) => {
          state.networkMsg = showedNetworkMsg;
        }),
      );
    }
  },
  updateStorageMsg(currentTime: number) {
    const { allStorageMsg } = get();

    let storageIndex = 0;
    while (
      storageIndex < allStorageMsg.length &&
      allStorageMsg[storageIndex].timestamp <= currentTime
    ) {
      const { data } = allStorageMsg[storageIndex];
      const { type, action } = data;
      switch (action) {
        case 'get':
          set(
            produce<ReplayStore>((state) => {
              state.storageMsg[type] = data.data;
            }),
          );
          break;
        case 'set':
          if (data.name) {
            set(
              produce<ReplayStore>((state) => {
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
            produce<ReplayStore>((state) => {
              state.storageMsg[type] = [];
            }),
          );
          break;
        case 'remove':
          set(
            produce<ReplayStore>((state) => {
              state.storageMsg[type] = state.storageMsg[type].filter(
                (i) => i.name !== data.name,
              );
            }),
          );
          break;
        default:
          break;
      }
      storageIndex += 1;
    }
  },
  isExpand: false,
  setIsExpand(expand: boolean) {
    set({ isExpand: expand });
  },
  speed: 1,
  setSpeed(speed: number) {
    set({ speed });
  },
}));
