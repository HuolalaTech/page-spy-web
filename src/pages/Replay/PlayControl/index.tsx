import { Col, Row } from 'antd';
import { ReactComponent as PlaySvg } from '@/assets/image/play.svg';
import { ReactComponent as PauseSvg } from '@/assets/image/pause.svg';
import Icon from '@ant-design/icons';
import './index.less';
import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';

interface Props {
  duration: number;
}

export const REPLAY_STATUS_CHANGE = 'replay-status-change';
export const REPLAY_PROGRESS_CHANGE = 'replay-progress-change';
export const REPLAY_END = 'replay-end';

export const PlayControl = ({ duration }: Props) => {
  const elapsed = useRef(0);
  const raf = useRef(0);
  const currentTimeEl = useRef<HTMLDivElement | null>(null);
  const timelineEl = useRef<HTMLDivElement | null>(null);
  const pointEl = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (elapsed.current === duration) return;
    window.dispatchEvent(
      new CustomEvent(REPLAY_STATUS_CHANGE, {
        detail: playing ? 'playing' : 'paused',
      }),
    );
  }, [duration, playing]);

  const onProgressChange = useCallback(
    (progress: number) => {
      if (pointEl.current) {
        pointEl.current.style.left = `${progress * 100}%`;
      }
      if (currentTimeEl.current) {
        currentTimeEl.current.textContent = dayjs
          .duration(elapsed.current)
          .format('mm:ss:SSS');
      }
      if (progress === 1) {
        elapsed.current = duration;
        setPlaying(false);
        window.dispatchEvent(new CustomEvent(REPLAY_END));
      } else {
        window.dispatchEvent(
          new CustomEvent(REPLAY_PROGRESS_CHANGE, {
            detail: elapsed.current,
          }),
        );
      }
    },
    [duration],
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
      elapsed.current = Math.ceil(progress < 0 ? 0 : progress * duration);

      onProgressChange(progress);
      setPlaying(false);
    };
    el.addEventListener('click', listener);
    return () => {
      el.removeEventListener('click', listener);
    };
  }, [duration, onProgressChange]);

  return (
    <div className="play-control">
      <Icon
        component={playing ? PauseSvg : PlaySvg}
        className="play-action"
        onClick={() => {
          if (!playing && elapsed.current / duration >= 1) return;
          setPlaying((playing) => !playing);
        }}
      />
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
};
