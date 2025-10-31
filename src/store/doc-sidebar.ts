import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface SidebarStore {
  show: boolean;
  setShow: (v: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  immer((set, get) => ({
    show: false,
    setShow: (v) => {
      const prev = get().show;
      if (v === prev) return;
      set((state) => {
        state.show = v;
      });
    },
  })),
);
