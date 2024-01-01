import { produce } from 'immer';
import { create } from 'zustand';

interface MiscInfo {
  isAutoScroll: boolean;
  setIsAutoScroll: (data: boolean) => void;
}

export const useMiscStore = create<MiscInfo>((set) => ({
  isAutoScroll: false,
  setIsAutoScroll: (data: boolean) => {
    set(
      produce<MiscInfo>((state) => {
        state.isAutoScroll = data;
      }),
    );
  },
}));
