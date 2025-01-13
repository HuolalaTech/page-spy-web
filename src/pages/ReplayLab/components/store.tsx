import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { Welcome } from './Welcome';

interface StepStore {
  current: number;
  prev: () => void;
  next: () => void;
}

export const useStepStore = create<StepStore>((set, get) => {
  return {
    current: 0,
    prev: () => set({ current: Math.max(0, get().current - 1) }),
    next: () => set({ current: Math.min(2, get().current + 1) }),
  };
});
