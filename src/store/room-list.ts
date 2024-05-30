import { produce } from 'immer';
import { create } from 'zustand';
import { chunk } from 'lodash-es';

interface StoreData {
  rowCount: number;
  columnCount: number;
  setColumnCount: (columns: number) => void;
  roomList: I.SpyRoom[][];
  updateRoomList: (data: I.SpyRoom[]) => Promise<void>;
}

const sortConnections = (data: I.SpyRoom[]) => {
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
  roomList: [],
  async updateRoomList(data: I.SpyRoom[]) {
    const { columnCount } = get();
    set(
      produce((state) => {
        state.rowCount = Math.ceil(data.length / columnCount);
        state.roomList = chunk(sortConnections(data), columnCount);
      }),
    );
  },
}));
