import './index.less';
import { memo, useCallback, useEffect, useRef } from 'react';
import { fixProgress, useReplayStore } from '@/store/replay';
import { useEventListener } from '@/utils/useEventListener';
import { CurrentTime } from './components/CurrentTime';
import { ProgressBar } from './components/ProgressBar';
import { Actions } from './components/Actions';
import { Duration } from './components/Duration';
import { useShallow } from 'zustand/react/shallow';
import { throttle } from 'lodash-es';
import { REPLAY_PROGRESS_SKIP } from '../events';

export const PlayControl = memo(() => {
  const [duration, speed, isPlaying, setIsPlaying, setProgress] =
    useReplayStore(
      useShallow((state) => [
        state.duration,
        state.speed,
        state.isPlaying,
        state.setIsPlaying,
        state.setProgress,
      ]),
    );

  useEventListener(
    'keyup',
    (evt) => {
      const { key } = evt as KeyboardEvent;
      if (key === ' ') {
        setIsPlaying(!isPlaying);
      }
    },
    { target: document },
  );
  const flushActiveData = useRef(
    throttle(useReplayStore.getState().flushActiveData, 100),
  );
  const elapsed = useRef(0);
  const raf = useRef(0);

  useEventListener(REPLAY_PROGRESS_SKIP, () => {
    const { progress, duration } = useReplayStore.getState();
    elapsed.current = progress * duration;
    flushActiveData.current();
  });

  const rafHandler = useCallback(() => {
    if (!duration) return;
    elapsed.current = elapsed.current + 16 * speed;

    const progress = fixProgress(elapsed.current / duration);
    setProgress(progress);
    if (progress === 1) {
      setIsPlaying(false);
    }
    flushActiveData.current();

    if (progress < 1 && isPlaying) {
      raf.current = requestAnimationFrame(rafHandler);
    }
  }, [duration, isPlaying, setIsPlaying, setProgress, speed]);

  useEffect(() => {
    const { progress, duration } = useReplayStore.getState();
    elapsed.current = progress * duration;

    if (isPlaying) {
      raf.current = requestAnimationFrame(rafHandler);
    } else {
      window.cancelAnimationFrame(raf.current);
    }
    return () => {
      window.cancelAnimationFrame(raf.current);
    };
  }, [rafHandler, isPlaying]);

  return (
    <div className="play-control">
      <Actions />
      <div className="play-progress">
        <CurrentTime />
        <ProgressBar />
        <Duration />
      </div>
    </div>
  );
});
