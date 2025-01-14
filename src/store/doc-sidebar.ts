import { produce } from 'immer';
import { create } from 'zustand';

interface SidebarStore {
  show: boolean;
  setShow: (v: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  show: false,
  setShow: (v) => {
    const prev = get().show;
    if (v === prev) return;
    set((state) => ({
      show: v,
    }));
  },
}));
