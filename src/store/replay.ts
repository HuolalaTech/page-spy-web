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

export interface HarborDataItem<T = any> {
  type: SpyMessage.DataType | 'rrweb-event';
  timestamp: number;
  data: T;
}

export interface ReplayStore {
  allConsoleMsg: HarborDataItem[];
  allNetworkMsg: HarborDataItem[];
  allRRwebEvent: eventWithTime[];
  allStorageMsg: HarborDataItem[];
  allSystemMsg: SpySystem.DataItem[];
  startTime: number;
  endTime: number;
  duration: number;
  consoleMsg: SpyConsole.DataItem[];
  networkMsg: SpyNetwork.RequestInfo[];
  storageMsg: SpyStorage.DataItem[];
  setAllData: (data: HarborDataItem[]) => void;
  updateElapsed: (elapsed: number) => void;
  updateConsoleMsg: (currentTime: number) => void;
  updateNetworkMsg: (currentTime: number) => void;
  updateStorageMsg: (currentTime: number) => void;
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
  storageMsg: [],
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
          acc.allStorageMsg.push(cur.data);
          break;
        case 'system':
          acc.allSystemMsg.push(cur.data);
          break;
      }
      return acc;
    }, result);

    console.log(allStorageMsg);
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
        produce((state) => {
          state.consoleMsg = [];
          state.networkMsg = [];
          state.storageMsg = [];
        }),
      );
      return;
    }
    if (currentTime >= endTime) {
      set(
        produce((state) => {
          state.consoleMsg = allConsoleMsg.map((i) => i.data);
          state.networkMsg = allNetworkMsg.map((i) => i.data);
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
    const { allStorageMsg, storageMsg } = get();
  },
}));
