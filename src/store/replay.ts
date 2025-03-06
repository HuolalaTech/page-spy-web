/* eslint-disable no-implicit-coercion */
import {
  SpyClient,
  SpyConsole,
  SpyStorage,
  SpySystem,
} from '@huolala-tech/page-spy-types';
import { create } from 'zustand';
import { eventWithTime } from '@rrweb/types';
import { produce } from 'immer';
import { isEqual, omit } from 'lodash-es';
import { REPLAY_STATUS_CHANGE } from '@/components/LogReplayer/events';
import {
  isRRWebClickEvent,
  ResolvedNetworkInfo,
  resolveUrlInfo,
} from '@/utils';
import { parseClientInfo, ParsedClientInfo } from '@/utils/brand';
import { DataType } from '@huolala-tech/page-spy-plugin-data-harbor/dist/types/harbor/base';
import { debug } from '@/utils/debug';

const isCaredActivity = (activity: HarborDataItem) => {
  const { type, data } = activity;
  if (type === 'console' && data.logType === 'error') return true;
  if (type === 'rrweb-event' && isRRWebClickEvent(data)) return true;
  return false;
};

// 决定 activity point 是否聚合
// 两个 activity point 的时间差和回放时长正相关；
// 或者说，时长越短、越要减少聚合；
const getActivityPointTimeDiff = (duration: number) => {
  const second = 1000;
  const minute = 60 * second;

  if (duration < 10 * second) return 0.1 * second;
  if (duration < 1 * minute) return 0.5 * second;
  if (duration < 5 * minute) return 1 * second;
  if (duration < 10 * minute) return 2 * second;
  if (duration < 30 * minute) return 5 * second;
  if (duration < 60 * minute) return 10 * second;
  return 20 * second;
};

export interface HarborDataItem<T = any> {
  type: DataType | 'meta'; // TODO
  timestamp: number;
  data: T;
}

export type MetaInfo = {
  title?: string;
  url?: string;
  remark?: string;
  startTime?: number;
  endTime?: number;
} & SpyClient.DataItem;

const isMetaInfo = (data: HarborDataItem): data is HarborDataItem<MetaInfo> => {
  return data.type === 'meta';
};

export type Activity = Omit<HarborDataItem, 'data'>[];

export enum TIME_MODE {
  RELATED = 'HH:mm:ss:SSS',
  ABSOLUTE = 'YYYY/MM/DD HH:mm:ss',
}

export interface ReplayStore {
  // data
  rrwebStartTime: number;
  setRRWebStartTime: (timestamp: number) => void;
  activity: Activity[];
  clientInfo: ParsedClientInfo | null;
  allConsoleMsg: HarborDataItem<SpyConsole.DataItem>[];
  allNetworkMsg: HarborDataItem<ResolvedNetworkInfo>[];
  allRRwebEvent: eventWithTime[];
  allStorageMsg: HarborDataItem<SpyStorage.DataItem>[];
  allSystemMsg: SpySystem.DataItem[];
  startTime: number;
  endTime: number;
  duration: number;
  consoleMsg: SpyConsole.DataItem[];
  networkMsg: ResolvedNetworkInfo[];
  storageMsg: Record<SpyStorage.DataType, SpyStorage.GetTypeDataItem['data']>;
  metaMsg: MetaInfo | null;
  setAllData: (data: HarborDataItem[]) => void;
  resetState: () => void;
  flushActiveData: () => void;
  updateConsoleMsg: (currentTime: number) => void;
  updateNetworkMsg: (currentTime: number) => void;
  updateStorageMsg: (currentTime: number) => void;

  // user-interactive
  isExpand: boolean;
  setIsExpand: (expand: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  progress: number;
  setProgress: (progress: number) => void;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  timeMode: TIME_MODE;
  setTimeMode: (mode: TIME_MODE) => void;
  autoScroll: boolean;
  setAutoScroll: (value: boolean) => void;
}

export const fixProgress = (progress: number) => {
  // prettier-ignore
  return progress < 0
    ? 0
    : progress > 1
      ? 1
      : progress;
};

export const useReplayStore = create<ReplayStore>((set, get) => ({
  rrwebStartTime: 0,
  setRRWebStartTime: (t) => {
    set(
      produce((state) => {
        state.rrwebStartTime = t;
      }),
    );
  },
  activity: [],
  clientInfo: null,
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
    // following 'storage' is just for type correct at now
    mpStorage: [],
    asyncStorage: [],
  },
  metaMsg: null,
  setAllData(data) {
    if (!data?.length) return;
    get().resetState();

    let start = data[0].timestamp;
    let end = data[data.length - 1].timestamp;

    const lastData = data[data.length - 1];

    if (isMetaInfo(lastData)) {
      set(
        produce((state) => {
          state.metaMsg = lastData.data;
        }),
      );
      const { data } = lastData;
      if (data.startTime && data.endTime) {
        data.startTime && (start = data.startTime);
        data.endTime && (end = data.endTime);
      }
      if (data.ua) {
        set(
          produce((state) => {
            state.clientInfo = parseClientInfo(data);
          }),
        );
      }
    }

    const duration = end - start;
    const activityPointTimeDiff = getActivityPointTimeDiff(duration);

    const result: Pick<
      ReplayStore,
      | 'activity'
      | 'allConsoleMsg'
      | 'allNetworkMsg'
      | 'allRRwebEvent'
      | 'allStorageMsg'
      | 'allSystemMsg'
    > = {
      activity: [],
      allConsoleMsg: [],
      allNetworkMsg: [],
      allRRwebEvent: [],
      allStorageMsg: [],
      allSystemMsg: [],
    };
    const {
      activity,
      allConsoleMsg,
      allNetworkMsg,
      allRRwebEvent,
      allSystemMsg,
      allStorageMsg,
    } = data.reduce((acc, cur) => {
      const { type, data, timestamp } = cur;
      if (timestamp < start) {
        if (type === 'rrweb-event') {
          acc.allRRwebEvent.push(data);
        }
        return acc;
      }

      if (isCaredActivity(cur)) {
        if (!acc.activity.length) {
          acc.activity.push([{ type, timestamp }]);
        } else {
          const lastFrame = acc.activity[acc.activity.length - 1];
          const lastItemInLastFrame = lastFrame[lastFrame.length - 1];
          if (
            lastItemInLastFrame.type === type &&
            timestamp - lastItemInLastFrame.timestamp < activityPointTimeDiff
          ) {
            lastFrame.push({ type, timestamp });
          } else {
            acc.activity.push([{ type, timestamp }]);
          }
        }
      }
      switch (type) {
        case 'console':
          acc.allConsoleMsg.push(cur);
          break;
        case 'network':
          acc.allNetworkMsg.push({
            type,
            timestamp,
            data: {
              ...data,
              ...resolveUrlInfo(data.url),
            },
          });
          break;
        case 'rrweb-event':
          acc.allRRwebEvent.push(data);
          break;
        case 'storage':
          acc.allStorageMsg.push(cur);
          break;
        case 'system':
          acc.allSystemMsg.push(data);
          break;
      }
      return acc;
    }, result);
    debug.log({
      rrweb: allRRwebEvent,
      console: allConsoleMsg,
      network: allNetworkMsg,
      storage: allStorageMsg,
      system: allSystemMsg,
      startTime: start,
      endTime: end,
      duration,
    });
    set(
      produce((state) => {
        state.activity = activity;
        state.allConsoleMsg = allConsoleMsg;
        state.allNetworkMsg = allNetworkMsg;
        state.allRRwebEvent = allRRwebEvent;
        state.allSystemMsg = allSystemMsg;
        state.allStorageMsg = allStorageMsg;
        state.startTime = start;
        state.endTime = end;
        state.duration = duration;
      }),
    );
  },
  resetState() {
    set(
      produce((state) => {
        Object.assign(state, useReplayStore.getInitialState());
      }),
    );
  },
  flushActiveData() {
    const {
      allConsoleMsg,
      progress,
      duration,
      startTime,
      endTime,
      updateConsoleMsg,
      updateNetworkMsg,
      updateStorageMsg,
    } = get();

    const currentTime = startTime + progress * duration;
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
            asyncStorage: [],
          };
        }),
      );
      return;
    }
    if (currentTime >= endTime) {
      set(
        produce((state) => {
          state.consoleMsg = allConsoleMsg.map((i) => i.data);
          updateNetworkMsg(currentTime);
          updateStorageMsg(currentTime);
        }),
      );
      return;
    }
    updateConsoleMsg(currentTime);
    updateNetworkMsg(currentTime);
    updateStorageMsg(currentTime);
  },
  updateConsoleMsg(currentTime) {
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
  updateNetworkMsg(currentTime) {
    const { allNetworkMsg, networkMsg } = get();

    let networkIndex = 0;
    const showedNetworkMsg: Map<string, ResolvedNetworkInfo> = new Map();
    while (
      networkIndex < allNetworkMsg.length &&
      allNetworkMsg[networkIndex].timestamp <= currentTime
    ) {
      const { data } = allNetworkMsg[networkIndex];
      const { id, requestType, endTime, response } = data;

      if (requestType === 'eventsource') {
        if (!showedNetworkMsg.has(id)) {
          const result = {
            ...data,
            response: [{ time: endTime, data: response }],
          };
          showedNetworkMsg.set(id, result);
        } else {
          showedNetworkMsg.get(id)!.response.push({
            time: endTime,
            data: response,
          });
        }
      } else {
        showedNetworkMsg.set(id, data);
      }
      networkIndex += 1;
    }

    set(
      produce((state) => {
        state.networkMsg = [...showedNetworkMsg.values()];
      }),
    );
  },
  updateStorageMsg(currentTime) {
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
  setIsExpand(expand) {
    set({ isExpand: expand });
  },
  speed: 1,
  setSpeed(speed) {
    set({ speed });
  },
  progress: 0,
  setProgress(progress) {
    set(
      produce((state) => {
        state.progress = fixProgress(progress);
      }),
    );
  },
  isPlaying: false,
  setIsPlaying(value) {
    set(
      produce((state) => {
        state.isPlaying = value;
      }),
    );
    window.dispatchEvent(new CustomEvent(REPLAY_STATUS_CHANGE));
  },
  timeMode: TIME_MODE.RELATED,
  setTimeMode(mode) {
    set(
      produce((state) => {
        state.timeMode = mode;
      }),
    );
  },
  autoScroll: false,
  setAutoScroll(value) {
    set(
      produce((state) => {
        state.autoScroll = value;
      }),
    );
  },
}));
