import { TIME_MODE, useReplayStore } from '@/store/replay';
import dayjs, { duration } from 'dayjs';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const CurrentTime = memo(() => {
  const currentTimeEl = useRef<HTMLDivElement | null>(null);
  const [startTime, duration, timeMode] = useReplayStore(
    useShallow((state) => [state.startTime, state.duration, state.timeMode]),
  );

  const getTimeContent = useCallback(
    (progress: number) => {
      const elapsed = Math.ceil(progress * duration);
      return timeMode === TIME_MODE.RELATED
        ? dayjs.duration(elapsed).format(TIME_MODE.RELATED)
        : dayjs(startTime + elapsed).format(TIME_MODE.ABSOLUTE);
    },
    [duration, startTime, timeMode],
  );

  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        if (!currentTimeEl.current) return;
        currentTimeEl.current.textContent = getTimeContent(state.progress);
      }),
    [getTimeContent],
  );

  return (
    <code className="play-current-time" ref={currentTimeEl}>
      {getTimeContent(0)}
    </code>
  );
});
