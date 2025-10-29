import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

interface MiscInfo {
  isAutoScroll: boolean;
  setIsAutoScroll: (data: boolean) => void;
}

export const useMiscStore = create<MiscInfo>()(
  immer((set) => ({
    isAutoScroll: false,
    setIsAutoScroll: (data: boolean) => {
      set((state) => {
        state.isAutoScroll = data;
      });
    },
  })),
);
