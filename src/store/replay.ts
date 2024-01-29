import {
  SpyConsole,
  SpyMessage,
  SpyNetwork,
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
  startTime: number;
  endTime: number;
  duration: number;
  consoleMsg: SpyConsole.DataItem[];
  networkMsg: SpyNetwork.RequestInfo[];
  setAllData: (data: HarborDataItem[]) => void;
  updateElapsed: (elapsed: number) => void;
}

export const useReplayStore = create<ReplayStore>((set, get) => ({
  allConsoleMsg: [],
  allNetworkMsg: [],
  allRRwebEvent: [],
  startTime: 0,
  endTime: 0,
  duration: 0,
  consoleMsg: [],
  networkMsg: [],
  setAllData: (data: HarborDataItem[]) => {
    if (!data?.length) return;

    const start = data[0].timestamp;
    const end = data[data.length - 1].timestamp;

    const result: Pick<
      ReplayStore,
      'allConsoleMsg' | 'allNetworkMsg' | 'allRRwebEvent'
    > = {
      allConsoleMsg: [],
      allNetworkMsg: [],
      allRRwebEvent: [],
    };
    const { allConsoleMsg, allNetworkMsg, allRRwebEvent } = data.reduce(
      (acc, cur) => {
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
        }
        return acc;
      },
      result,
    );

    set(
      produce((state) => {
        state.allConsoleMsg = allConsoleMsg;
        state.allNetworkMsg = allNetworkMsg;
        state.allRRwebEvent = allRRwebEvent;
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
      startTime,
      endTime,
      consoleMsg,
      networkMsg,
    } = get();

    const currentTime = startTime + elapsed;
    if (currentTime <= startTime) {
      set(
        produce((state) => {
          state.consoleMsg = [];
          state.networkMsg = [];
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
}));
