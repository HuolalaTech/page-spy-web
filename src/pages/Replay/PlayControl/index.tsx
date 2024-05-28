import './index.less';
import { memo, useCallback, useEffect, useRef } from 'react';
import { REPLAY_END, REPLAY_PROGRESS_CHANGE } from '../events';
import { fixProgress, useReplayStore } from '@/store/replay';
import { useEventListener } from '@/utils/useEventListener';
import { CurrentTime } from './components/CurrentTime';
import { ProgressBar } from './components/ProgressBar';
import { Actions } from './components/Actions';
import { Duration } from './components/Duration';
import { useShallow } from 'zustand/react/shallow';

export const PlayControl = memo(() => {
  const [
    duration,
    speed,
    isPlaying,
    setIsPlaying,
    setProgress,
    flushActiveData,
  ] = useReplayStore(
    useShallow((state) => [
      state.duration,
      state.speed,
      state.isPlaying,
      state.setIsPlaying,
      state.setProgress,
      state.flushActiveData,
    ]),
  );
  const elapsed = useRef(0);
  const raf = useRef(0);

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

  const rafHandler = useCallback(() => {
    if (!duration) return;
    elapsed.current = elapsed.current + 16 * speed;

    const progress = fixProgress(elapsed.current / duration);
    setProgress(progress);

    if (progress === 1) {
      setIsPlaying(false);
      window.dispatchEvent(new CustomEvent(REPLAY_END));
    } else {
      window.dispatchEvent(
        new CustomEvent(REPLAY_PROGRESS_CHANGE, {
          detail: elapsed.current,
        }),
      );
    }
    flushActiveData();

    if (progress < 1 && isPlaying) {
      raf.current = requestAnimationFrame(rafHandler);
    }
  }, [duration, isPlaying, setIsPlaying, setProgress, speed, flushActiveData]);

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
