import { HarborDataItem, useReplayStore } from '@/store/replay';
import { Tooltip } from 'antd';
import { useRef, useEffect, useMemo, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { REPLAY_PROGRESS_SKIP } from '../../events';

const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 10 * ONE_MINUTE;
const HALF_ONE_HOUR = 30 * ONE_MINUTE;
const ACTIVITY_EVENT_NAME_MAP = {
  console: 'Error',
  'rrweb-event': 'Click',
} as Record<HarborDataItem['type'], string>;

export const ProgressBar = memo(() => {
  const [
    rrwebStartTime,
    activity,
    startTime,
    duration,
    metaMsg,
    setProgress,
    setIsPlaying,
    flushActiveData,
  ] = useReplayStore(
    useShallow((state) => [
      state.rrwebStartTime,
      state.activity,
      state.startTime,
      state.duration,
      state.metaMsg,
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
  const cachedProgress = useRef('');
  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        requestAnimationFrame(() => {
          if (!pointEl.current) return;

          const latest = (state.progress * 100).toFixed(decimalPlaces);
          if (cachedProgress.current === latest) return;
          cachedProgress.current = latest;

          pointEl.current.style.left = `${latest}%`;
        });
      }),
    [decimalPlaces],
  );

  const activityPoints = useMemo(() => {
    return activity.map((a) => {
      const startTimestamp =
        metaMsg?.startTime ??
        (a[0].type === 'rrweb-event' ? rrwebStartTime : startTime);
      const itemDuration = a[a.length - 1].timestamp - a[0].timestamp;
      const timeOffset = (a[0].timestamp - startTimestamp) / duration;
      const timeDuration =
        itemDuration === 0 ? 0.0001 : itemDuration / duration;
      return {
        timeOffset,
        timeDuration,
        eventType: a[0].type,
        eventCount: a.length,
      };
    });
  }, [activity, duration, metaMsg, rrwebStartTime, startTime]);

  // "Skip" in timeline by click
  useEffect(() => {
    const el = timelineEl.current;
    if (!el) return;

    const listener = (evt: MouseEvent) => {
      const { left, width } = el!.getBoundingClientRect();
      const diff = evt.clientX - left;
      const progress = Math.min(diff / width, 1);

      setProgress(progress);
      window.dispatchEvent(new CustomEvent(REPLAY_PROGRESS_SKIP));
    };
    el.addEventListener('click', listener);
    return () => {
      el.removeEventListener('click', listener);
    };
  }, [setIsPlaying, setProgress]);

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
        const title = ACTIVITY_EVENT_NAME_MAP[a.eventType] || 'undefined';
        return (
          <Tooltip
            key={a.timeOffset}
            title={
              <div key={a.timeOffset}>
                <b>{title}: </b>
                <span>{a.eventCount}</span>
              </div>
            }
          >
            <div
              className="point-item"
              data-event={title}
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
