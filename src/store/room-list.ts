import { produce } from 'immer';
import { create } from 'zustand';
import { chunk } from 'lodash-es';
import { ClientInfo } from '@/utils/brand';

export type ParsedRoom = I.SpyRoom & ClientInfo;

interface StoreData {
  rowCount: number;
  columnCount: number;
  setColumnCount: (columns: number) => void;
  originList: ParsedRoom[];
  setOriginList: (data: ParsedRoom[]) => void;
  rowRooms: ParsedRoom[][];
  computeRowRooms: () => void;
}

const sortConnections = (data: ParsedRoom[]) => {
  const [valid, invalid] = (data || []).reduce(
    (acc, cur) => {
      const hasClient =
        cur.connections.findIndex((i) => i.userId === 'Client') > -1;
      if (hasClient) acc[0].push(cur);
      else acc[1].push(cur);
      return acc;
    },
    [[], []] as any[][],
  );

  // 有效房间再按创建时间升序
  const ascWithCreatedAtForInvalid = valid.sort((a, b) => {
    if (a.createdAt < b.createdAt) {
      return -1;
    }
    return 1;
  });
  // 失效房间再按活动时间降序
  const ascWithActiveAtForInvalid = invalid.sort((a, b) => {
    if (a.activeAt > b.activeAt) {
      return -1;
    }
    return 1;
  });

  return [...ascWithCreatedAtForInvalid, ...ascWithActiveAtForInvalid];
};

export const useRoomListStore = create<StoreData>((set, get) => ({
  rowCount: 0,
  columnCount: 6,
  setColumnCount(columns) {
    set(
      produce((state) => {
        state.columnCount = columns;
      }),
    );
  },
  originList: [],
  setOriginList(data: ParsedRoom[]) {
    set(
      produce((state) => {
        state.originList = data;
      }),
    );
  },
  rowRooms: [],
  computeRowRooms() {
    const { columnCount, originList } = get();
    set(
      produce((state) => {
        state.rowCount = Math.ceil(originList.length / columnCount);
        state.rowRooms = chunk(sortConnections(originList), columnCount);
      }),
    );
  },
}));
