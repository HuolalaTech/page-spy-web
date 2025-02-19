import { create } from 'zustand';
import { debounce } from 'lodash-es';

interface StepStore {
  current: number;
  goto: (c: number) => void;
  prev: () => void;
  next: () => void;

  replayUrl: string;
  setReplayUrl: (replayUrl: string) => void;
}

export const useStepStore = create<StepStore>((set, get) => {
  return {
    current: 0,
    goto: debounce((current: number) => set({ current }), 300, {
      leading: true,
      trailing: false,
    }),
    prev: () => get().goto(Math.max(0, get().current - 1)),
    next: () => get().goto(Math.min(1, get().current + 1)),

    replayUrl: '',
    setReplayUrl(replayUrl) {
      const prev = get().replayUrl;
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      if (replayUrl) {
        set({ replayUrl });
      }
    },
  };
});
