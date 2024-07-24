import { useReplayStore } from '@/store/replay';
import { Tooltip } from 'antd';
import { useRef, useEffect, useMemo, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 10 * ONE_MINUTE;
const HALF_ONE_HOUR = 30 * ONE_MINUTE;
const ACTIVITY_EVENT_NAME_MAP = {
  console: 'Error',
  'rrweb-event': 'Click',
};

export const ProgressBar = memo(() => {
  const [
    rrwebStartTime,
    activity,
    startTime,
    duration,
    setProgress,
    setIsPlaying,
    flushActiveData,
  ] = useReplayStore(
    useShallow((state) => [
      state.rrwebStartTime,
      state.activity,
      state.startTime,
      state.duration,
      state.setProgress,
      state.setIsPlaying,
      state.flushActiveData,
    ]),
  );

  const decimalPlaces = useMemo(() => {
    // 优化项，如果日志的时长比较久，降低进度条上的 point 更新频率
    // 这里是通过控制 style.left 百分比的小数点实现
    if (duration < ONE_MINUTE) return 3;
    if (duration < TEN_MINUTES) return 2;
    if (duration < HALF_ONE_HOUR) return 1;
    return 0;
  }, [duration]);

  const timelineEl = useRef<HTMLDivElement | null>(null);
  const pointEl = useRef<(HTMLDivElement & { isMoving: boolean }) | null>(null);
  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        if (!pointEl.current) return;
        pointEl.current.style.left = `${(state.progress * 100).toFixed(
          decimalPlaces,
        )}%`;
      }),
    [decimalPlaces],
  );

  // "Skip" in timeline by click
  useEffect(() => {
    const el = timelineEl.current;
    if (!el) return;

    const listener = (evt: MouseEvent) => {
      const { left, width } = el!.getBoundingClientRect();
      const diff = evt.clientX - left;
      const progress = Math.min(diff / width, 1);

      setIsPlaying(false);
      setProgress(progress);
      flushActiveData();
    };
    el.addEventListener('click', listener);
    return () => {
      el.removeEventListener('click', listener);
    };
  }, [flushActiveData, setIsPlaying, setProgress]);

  // "Skip" in timeline by drag
  useEffect(() => {
    const point = pointEl.current;
    const line = timelineEl.current;
    if (!point || !line) return;

    let pointRect: DOMRect;
    let lineRect: DOMRect;
    let startX = 0;
    const critical = {
      left: 0,
      right: 0,
    };
    let dragProgress = 0;
    let isPlaying = false;

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

      dragProgress = (resultX - lineRect.left) / lineRect.width;
      setProgress(dragProgress);
    }
    function end() {
      startX = 0;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);

      point!.isMoving = false;
      setProgress(dragProgress);
      flushActiveData();
      setIsPlaying(isPlaying);
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

      isPlaying = useReplayStore.getState().isPlaying;
      setIsPlaying(false);
    }
    point.addEventListener('mousedown', start, false);
    return () => {
      point.removeEventListener('mousedown', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
    };
  }, [duration, flushActiveData, setIsPlaying, setProgress]);

  return (
    <div className="play-timeline" ref={timelineEl}>
      <div className="play-current-point" ref={pointEl} />
      {activity.map((a, index) => {
        const title = ACTIVITY_EVENT_NAME_MAP[a.type];
        const startTimestamp =
          a.type === 'rrweb-event' ? rrwebStartTime : startTime;
        const left = (a.timestamp - startTimestamp) / duration;
        return (
          <Tooltip key={a.timestamp + index} title={title}>
            <div
              className="point-item"
              data-event={title}
              style={{
                left: `${left * 100}%`,
              }}
            />
          </Tooltip>
        );
      })}
    </div>
  );
});
