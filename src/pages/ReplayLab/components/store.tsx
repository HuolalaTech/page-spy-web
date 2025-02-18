import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { Welcome } from './Welcome';
import { debounce } from 'lodash-es';

interface StepStore {
  current: number;
  goto: (c: number) => void;
  prev: () => void;
  next: () => void;
}

export const useStepStore = create<StepStore>((set, get) => {
  return {
    current: 0,
    goto: debounce((current: number) => set({ current }), 300, {
      leading: true,
      trailing: false,
    }),
    prev: () => get().goto(Math.max(0, get().current - 1)),
    next: () => get().goto(Math.min(2, get().current + 1)),
  };
});
