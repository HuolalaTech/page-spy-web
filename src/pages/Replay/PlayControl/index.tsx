import { ReactComponent as PlaySvg } from '@/assets/image/play.svg';
import { ReactComponent as PauseSvg } from '@/assets/image/pause.svg';
import Icon from '@ant-design/icons';
import './index.less';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
  REPLAY_STATUS_CHANGE,
  REPLAY_END,
  REPLAY_PROGRESS_CHANGE,
} from '../events';
import { Space } from 'antd';
import { useReplayStore } from '@/store/replay';
import { useEventListener } from '@/utils/useEventListener';

interface Props {
  duration: number;
}

export const PlayControl = memo(({ duration }: Props) => {
  const elapsed = useRef(0);
  const raf = useRef(0);
  const currentTimeEl = useRef<HTMLDivElement | null>(null);
  const timelineEl = useRef<HTMLDivElement | null>(null);
  const pointEl = useRef<(HTMLDivElement & { isMoving: boolean }) | null>(null);
  const [playing, setPlaying] = useState(false);
  const updateElapsed = useReplayStore((state) => state.updateElapsed);

  useEventListener(
    'keyup',
    (evt) => {
      const { key } = evt as KeyboardEvent;
      if (key === ' ') {
        setPlaying((playing) => !playing);
      }
    },
    { target: document },
  );

  const onStatusChange = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent(REPLAY_STATUS_CHANGE, {
        detail: {
          status: playing ? 'playing' : 'paused',
          elapsed: elapsed.current,
        },
      }),
    );
  }, [playing]);

  useEffect(onStatusChange, [onStatusChange, playing]);

  const onProgressChange = useCallback(
    (progress: number) => {
      elapsed.current = Math.ceil(progress < 0 ? 0 : progress * duration);
      if (progress === 1) {
        setPlaying(false);
        window.dispatchEvent(new CustomEvent(REPLAY_END));
      } else {
        window.dispatchEvent(
          new CustomEvent(REPLAY_PROGRESS_CHANGE, {
            detail: elapsed.current,
          }),
        );
      }
      updateElapsed(elapsed.current);

      if (pointEl.current?.isMoving) return;

      pointEl.current!.style.left = `${progress * 100}%`;
      currentTimeEl.current!.textContent = dayjs
        .duration(elapsed.current)
        .format('mm:ss:SSS');
    },
    [duration, updateElapsed],
  );

  const rafHandler = useCallback(() => {
    if (!duration) return;
    elapsed.current += 16;
    const progress = Math.min(elapsed.current / duration, 1);
    onProgressChange(progress);

    if (progress < 1 && playing) {
      raf.current = requestAnimationFrame(rafHandler);
    }
  }, [duration, onProgressChange, playing]);

  useEffect(() => {
    if (playing) {
      raf.current = requestAnimationFrame(rafHandler);
    } else {
      window.cancelAnimationFrame(raf.current);
    }
  }, [rafHandler, playing]);

  // "Skip" in timeline by click
  useEffect(() => {
    const el = timelineEl.current;
    if (!duration || !el) return;

    const listener = (evt: MouseEvent) => {
      const { left, width } = el!.getBoundingClientRect();
      const diff = evt.clientX - left;
      const progress = Math.min(diff / width, 1);

      setPlaying(false);
      onStatusChange();
      onProgressChange(progress);
    };
    el.addEventListener('click', listener);
    return () => {
      el.removeEventListener('click', listener);
    };
  }, [duration, onProgressChange, onStatusChange]);

  // "Skip" in timeline by mousedown / mousemove
  useEffect(() => {
    const currentTime = currentTimeEl.current;
    const point = pointEl.current;
    const line = timelineEl.current;
    if (!duration || !currentTime || !point || !line) return;

    let pointRect: DOMRect;
    let lineRect: DOMRect;
    let startX = 0;
    const critical = {
      left: 0,
      right: 0,
    };
    let progress = 0;

    function move(evt: MouseEvent) {
      point!.isMoving = true;
      evt.preventDefault();
      const diffX = evt.clientX - startX;
      const offset = pointRect.width / 2;
      let resultX = pointRect.x + offset + diffX;
      if (resultX < critical.left) {
        resultX = critical.left;
      } else if (resultX > critical.right) {
        resultX = critical.right;
      }
      const current = (resultX - lineRect.left) / lineRect.width;
      // prettier-ignore
      progress = current < 0
        ? 0
        : current > 1
          ? 1
          : current;

      point!.style.left = `${progress * 100}%`;
      currentTime!.textContent = dayjs
        .duration(Math.ceil(progress * duration))
        .format('mm:ss:SSS');
    }
    function end(evt: MouseEvent) {
      startX = 0;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);

      point!.isMoving = false;
      setPlaying(false);
      onStatusChange();
      onProgressChange(progress);
    }
    function start(evt: MouseEvent) {
      evt.preventDefault();
      point!.isMoving = false;
      pointRect = point!.getBoundingClientRect();
      lineRect = line!.getBoundingClientRect();
      critical.left = lineRect.left;
      critical.right = lineRect.left + lineRect.width;

      startX = evt.clientX;
      document.addEventListener('mousemove', move, false);
      document.addEventListener('mouseup', end, false);
    }
    point.addEventListener('mousedown', start, false);
    return () => {
      point.removeEventListener('mousedown', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
    };
  }, [duration, onProgressChange, onStatusChange]);

  return (
    <div className="play-control">
      <Space>
        <Icon
          component={playing ? PauseSvg : PlaySvg}
          className="play-action toggle-play-status"
          onClick={() => {
            if (!playing && elapsed.current / duration >= 1) return;
            setPlaying((playing) => !playing);
          }}
        />
      </Space>
      <div className="play-progress">
        <code className="play-current-time" ref={currentTimeEl}>
          {dayjs.duration(elapsed.current).format('mm:ss:SSS')}
        </code>
        <div className="play-timeline" ref={timelineEl}>
          <div className="play-current-point" ref={pointEl} />
        </div>
        <code className="play-duration-time">
          {dayjs.duration(duration).format('mm:ss:SSS')}
        </code>
      </div>
    </div>
  );
});
