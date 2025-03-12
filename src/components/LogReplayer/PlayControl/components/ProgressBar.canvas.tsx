import { HarborDataItem, useReplayStore } from '@/store/replay';
import { useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { REPLAY_PROGRESS_SKIP } from '../../events';
import { debug } from '@/utils/debug';

const CANVAS_PADDING_BLOCK = 4; // 画布上下内边距
const TRACK_SIZE = 8; // 轨道高度
const THUMB_SIZE = 18; // 滑块大小
const THUMB_HOVER_SIZE = 20; // 滑块 "划过" 大小
const POINT_SIZE = 12; // 活动点大小

const ACTIVITY_POINT_COLOR_MAP = {
  console: '#279bd5',
  'rrweb-event': '#fc4d4d',
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

  const canvasEl = useRef<HTMLCanvasElement | null>(null);

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

  const cachedProgress = useRef(0);
  const thumbIsHover = useRef(false);
  const draw = useCallback(() => {
    const canvas = canvasEl.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.style.height = `${THUMB_HOVER_SIZE + CANVAS_PADDING_BLOCK * 2}px`;
    canvas.width = width * dpr;
    canvas.height = (THUMB_HOVER_SIZE + CANVAS_PADDING_BLOCK * 2) * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { current: progress } = cachedProgress;

    // 参考值
    const threshold = {
      left: THUMB_HOVER_SIZE / 2,
      right: width - THUMB_HOVER_SIZE / 2,
      center: CANVAS_PADDING_BLOCK + THUMB_HOVER_SIZE / 2,
      width: width - THUMB_HOVER_SIZE,
    };

    // 时间轴
    ctx.beginPath();
    ctx.fillStyle = 'rgba(132, 52, 233, 0.3)';
    if (ctx.roundRect) {
      ctx.roundRect(
        threshold.left,
        threshold.center - TRACK_SIZE / 2,
        threshold.width,
        TRACK_SIZE,
        5,
      );
    } else {
      ctx.fillRect(
        threshold.left,
        threshold.center - TRACK_SIZE / 2,
        threshold.width,
        TRACK_SIZE,
      );
    }
    ctx.fill();

    // activity points
    ctx.beginPath();
    activityPoints.forEach((point) => {
      const color = ACTIVITY_POINT_COLOR_MAP[point.eventType];
      if (!color) {
        debug.error('Unhandled activity point type', point.eventType);
        return;
      }
      ctx.fillStyle = color;
      ctx.fillRect(
        threshold.left + point.timeOffset * threshold.width,
        CANVAS_PADDING_BLOCK + (THUMB_SIZE - POINT_SIZE) / 2,
        Math.max(point.timeDuration * threshold.width, 2),
        POINT_SIZE,
      );
    });

    // 滑块
    ctx.beginPath();
    ctx.fillStyle = '#8434e9';
    ctx.arc(
      threshold.left + progress * threshold.width,
      threshold.center,
      (thumbIsHover.current ? THUMB_HOVER_SIZE : THUMB_SIZE) / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }, [activityPoints]);

  useEffect(() => {
    draw();
  }, [activityPoints, draw]);

  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        requestAnimationFrame(() => {
          const latest = Number(state.progress.toFixed(3));
          if (cachedProgress.current === latest) return;
          cachedProgress.current = latest;

          draw();
        });
      }),
    [draw],
  );

  useEffect(() => {
    const canvas = canvasEl.current;
    if (!canvas) return;

    // Skip in timeline by click
    const clickFn = (evt: MouseEvent) => {
      const { left, width } = canvas.getBoundingClientRect();
      const progress = (evt.clientX - left) / width;
      setProgress(Math.min(Math.abs(progress), 1));
      window.dispatchEvent(new CustomEvent(REPLAY_PROGRESS_SKIP));
    };

    // Skip in timeline by drag
    let isDragging = false;
    let startX = 0;
    const critical = {
      left: 0,
      right: 0,
      width: 0,
    };
    let dragProgress = 0;
    const mouseIsInThumb = (evt: MouseEvent) => {
      const { left, width, top, bottom } = canvas.getBoundingClientRect();
      const position = evt.clientX - left;
      const threshold = {
        top: top + CANVAS_PADDING_BLOCK,
        right: cachedProgress.current * width + THUMB_HOVER_SIZE / 2,
        bottom: bottom - CANVAS_PADDING_BLOCK,
        left: cachedProgress.current * width - THUMB_HOVER_SIZE / 2,
      };
      // console.log(
      //   position,
      //   threshold.left,
      // );
      return (
        evt.clientY >= threshold.top &&
        position <= threshold.right &&
        evt.clientY <= threshold.bottom &&
        position >= threshold.left
      );
    };

    const documentMouseMoveFn = (evt: MouseEvent) => {
      if (!isDragging) return;

      const diffX = evt.clientX - startX;
      let resultX = startX + diffX;
      if (resultX < critical.left) {
        resultX = critical.left;
      } else if (resultX > critical.right) {
        resultX = critical.right;
      }
      dragProgress = (resultX - critical.left) / critical.width;
      setProgress(dragProgress);
    };
    const documentMouseUpFn = () => {
      setProgress(dragProgress);
      flushActiveData();
      setIsPlaying(true);

      isDragging = false;
      startX = 0;
      dragProgress = 0;
      document.removeEventListener('mousemove', documentMouseMoveFn);
      document.removeEventListener('mouseup', documentMouseUpFn);
    };
    const canvasMouseDownFn = (evt: MouseEvent) => {
      if (!mouseIsInThumb(evt)) return;

      const { left, right, width } = canvas.getBoundingClientRect();
      critical.left = left;
      critical.right = right;
      critical.width = width;
      isDragging = true;
      startX = evt.clientX;
      setIsPlaying(false);
      document.addEventListener('mousemove', documentMouseMoveFn);
      document.addEventListener('mouseup', documentMouseUpFn);
    };
    const canvasMouseMoveFn = (evt: MouseEvent) => {
      thumbIsHover.current = mouseIsInThumb(evt);
      draw();
    };

    canvas.addEventListener('click', clickFn);
    canvas.addEventListener('mousedown', canvasMouseDownFn);
    canvas.addEventListener('mousemove', canvasMouseMoveFn);
    return () => {
      canvas.removeEventListener('click', clickFn);
      canvas.removeEventListener('mousedown', canvasMouseDownFn);
      canvas.removeEventListener('mousemove', canvasMouseMoveFn);
    };
  }, [draw, flushActiveData, setIsPlaying, setProgress]);

  return (
    <canvas
      className="canvas-timeline"
      ref={canvasEl}
      height={THUMB_HOVER_SIZE}
    />
  );
});
