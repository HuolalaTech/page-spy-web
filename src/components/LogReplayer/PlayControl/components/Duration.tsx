import { TIME_MODE, useReplayStore } from '@/store/replay';
import dayjs, { duration } from 'dayjs';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const Duration = memo(() => {
  const [timeMode, duration, endTime] = useReplayStore(
    useShallow((state) => [state.timeMode, state.duration, state.endTime]),
  );

  return (
    <code className="play-duration-time">
      {(timeMode === TIME_MODE.RELATED
        ? dayjs.duration(duration)
        : dayjs(endTime)
      ).format(timeMode)}
    </code>
  );
});
