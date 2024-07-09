import { Activity, useReplayStore } from '@/store/replay';
import { Tooltip } from 'antd';
import { useRef, useEffect, useMemo, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 10 * ONE_MINUTE;
const HALF_ONE_HOUR = 30 * ONE_MINUTE;
const ONE_HOUR = 60 * ONE_MINUTE;

export const ProgressBar = memo(() => {
  const [
    activity,
    startTime,
    duration,
    setProgress,
    setIsPlaying,
    flushActiveData,
  ] = useReplayStore(
    useShallow((state) => [
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

  const activityPoints = useMemo(() => {
    return activity.map((a) => {
      const itemDuration = a[a.length - 1].timestamp - a[0].timestamp;
      const timeOffset = (a[0].timestamp - startTime) / duration;
      const timeDuration =
        itemDuration === 0 ? 0.0001 : itemDuration / duration;
      const eventsCount = a.reduce((acc, cur) => {
        if (!acc[cur.type]) {
          acc[cur.type] = 0;
        }
        acc[cur.type] += 1;
        return acc;
      }, {} as Record<Activity[number]['type'], number>);
      return {
        timeOffset,
        timeDuration,
        eventsCount,
      };
    });
  }, [activity, duration, startTime]);

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
      {activityPoints.map((a) => {
        return (
          <Tooltip
            key={a.timeOffset}
            title={Object.entries(a.eventsCount).map(([event, count]) => (
              <div key={event}>
                <b>{event}: </b>
                <span>{count}</span>
              </div>
            ))}
          >
            <div
              className="point-item"
              style={{
                width: `${a.timeDuration * 100}%`,
                left: `${a.timeOffset * 100}%`,
              }}
            />
          </Tooltip>
        );
      })}
    </div>
  );
});
