import { create } from 'zustand';

interface ExpandStore {
  isExpand: boolean;
  setIsExpand: (v: boolean) => void;
}

export const useReplayerExpand = create<ExpandStore>((set, get) => ({
  isExpand: false,
  setIsExpand(v) {
    set({ isExpand: v });
  },
}));
