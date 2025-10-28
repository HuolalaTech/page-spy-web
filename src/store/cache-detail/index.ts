import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

interface DetailInfo {
  currentDetail: any;
  setCurrentDetail: (data: any) => void;
}

export const useCacheDetailStore = create<DetailInfo>()(
  immer((set) => ({
    currentDetail: null,
    setCurrentDetail: (data) => {
      set((state) => {
        state.currentDetail = data;
      });
    },
  })),
);
