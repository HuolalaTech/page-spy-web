import { produce } from 'immer';
import { create } from 'zustand';

interface DetailInfo {
  currentDetail: any;
  setCurrentDetail: (data: any) => void;
}

export const useCacheDetailStore = create<DetailInfo>((set) => ({
  currentDetail: null,
  setCurrentDetail: (data) => {
    set(
      produce<DetailInfo>((state) => {
        state.currentDetail = data;
      }),
    );
  },
}));
