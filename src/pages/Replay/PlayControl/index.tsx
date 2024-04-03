import { ReactComponent as PlaySvg } from '@/assets/image/play.svg';
import { ReactComponent as PauseSvg } from '@/assets/image/pause.svg';
import { ReactComponent as RelateTimeSvg } from '@/assets/image/related-time.svg';
import { ReactComponent as AbsoluteTimeSvg } from '@/assets/image/absolute-time.svg';
import Icon from '@ant-design/icons';
import './index.less';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
  REPLAY_STATUS_CHANGE,
  REPLAY_END,
  REPLAY_PROGRESS_CHANGE,
} from '../events';
import { Space, Tooltip, Select } from 'antd';
import { Activity, useReplayStore } from '@/store/replay';
import { useEventListener } from '@/utils/useEventListener';
import { useTranslation } from 'react-i18next';

const fixProgress = (progress: number) => {
  // prettier-ignore
  return progress < 0
    ? 0
    : progress > 1
      ? 1
      : progress;
};

export const PlayControl = memo(() => {
  const { t } = useTranslation();
  const elapsed = useRef(0);
  const raf = useRef(0);
  const currentTimeEl = useRef<HTMLDivElement | null>(null);
  const timelineEl = useRef<HTMLDivElement | null>(null);
  const pointEl = useRef<(HTMLDivElement & { isMoving: boolean }) | null>(null);
  const [playing, setPlaying] = useState(false);
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

  const [isRelatedTimeMode, setIsRelatedTimeMode] = useState(true);
  const timeFormat = useMemo(() => {
    return isRelatedTimeMode ? 'mm:ss:SSS' : 'YYYY/MM/DD HH:mm:ss';
  }, [isRelatedTimeMode]);
  const [
    activity,
    startTime,
    endTime,
    duration,
    updateElapsed,
    speed,
    setSpeed,
  ] = useReplayStore((state) => [
    state.activity,
    state.startTime,
    state.endTime,
    state.duration,
    state.updateElapsed,
    state.speed,
    state.setSpeed,
  ]);
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

  const computeCurrentTime = useCallback(
    (elapsed: number) => {
      if (isRelatedTimeMode) {
        return dayjs.duration(elapsed).format(timeFormat);
      } else {
        return dayjs(startTime + elapsed).format(timeFormat);
      }
    },
    [startTime, timeFormat, isRelatedTimeMode],
  );
  const handleUpdateAfterProgressChange = useCallback(
    (progress: number) => {
      if (pointEl.current) {
        pointEl.current.style.left = `${progress * 100}%`;
      }
      if (currentTimeEl.current) {
        const elapsed = Math.ceil(progress * duration);
        currentTimeEl.current!.textContent = computeCurrentTime(elapsed);
      }
    },
    [computeCurrentTime, duration],
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
      // eslint-disable-next-line no-param-reassign
      progress = fixProgress(progress);
      elapsed.current = Math.ceil(progress * duration);
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
      handleUpdateAfterProgressChange(progress);
    },
    [duration, handleUpdateAfterProgressChange, updateElapsed],
  );

  const rafHandler = useCallback(() => {
    if (!duration) return;
    elapsed.current += 16 * speed;
    const progress = Math.min(elapsed.current / duration, 1);
    onProgressChange(progress);

    if (progress < 1 && playing) {
      raf.current = requestAnimationFrame(rafHandler);
    }
  }, [duration, onProgressChange, playing, speed]);

  useEffect(() => {
    if (playing) {
      raf.current = requestAnimationFrame(rafHandler);
    } else {
      window.cancelAnimationFrame(raf.current);
    }
    return () => {
      window.cancelAnimationFrame(raf.current);
    };
  }, [rafHandler, playing]);

  // "Skip" in timeline by click
  useEffect(() => {
    const el = timelineEl.current;
    if (!duration || !el) return;

    const listener = (evt: MouseEvent) => {
      const { left, width } = el!.getBoundingClientRect();
      const diff = evt.clientX - left;
      const progress = Math.min(diff / width, 1);

      onProgressChange(progress);
      onStatusChange();
    };
    el.addEventListener('click', listener);
    return () => {
      el.removeEventListener('click', listener);
    };
  }, [duration, onProgressChange, onStatusChange]);

  // "Skip" in timeline by drag
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
      progress = fixProgress((resultX - lineRect.left) / lineRect.width);
      handleUpdateAfterProgressChange(progress);
    }
    function end() {
      startX = 0;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);

      point!.isMoving = false;
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
  }, [
    duration,
    handleUpdateAfterProgressChange,
    onProgressChange,
    onStatusChange,
  ]);

  return (
    <div className="play-control">
      <div className="play-actions">
        <Space>
          <Icon
            component={playing ? PauseSvg : PlaySvg}
            className="play-action__btn toggle-play-status"
            onClick={() => {
              if (!playing && elapsed.current / duration >= 1) {
                onProgressChange(0);
                setPlaying(true);
                return;
              }
              setPlaying((playing) => !playing);
            }}
          />
        </Space>
        <Space size="small" className="right-actions">
          <Select
            size="middle"
            bordered={false}
            defaultValue={speed}
            placeholder={t('replay.speed')}
            style={{ width: '65px' }}
            showArrow={false}
            options={[
              { label: '0.5x', value: 0.5 },
              { label: '1.0x', value: 1 },
              { label: '2.0x', value: 2 },
              { label: '3.0x', value: 3 },
              { label: '4.0x', value: 4 },
            ]}
            onChange={setSpeed}
          />
          <Tooltip
            title={
              isRelatedTimeMode
                ? t('replay.related-time')
                : t('replay.absolute-time')
            }
          >
            <Icon
              component={isRelatedTimeMode ? RelateTimeSvg : AbsoluteTimeSvg}
              className="play-action__btn"
              onClick={() => {
                setIsRelatedTimeMode((mode) => !mode);
              }}
            />
          </Tooltip>
        </Space>
      </div>
      <div className="play-progress">
        <code className="play-current-time" ref={currentTimeEl}>
          {computeCurrentTime(elapsed.current)}
        </code>
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
        <code className="play-duration-time">
          {(isRelatedTimeMode
            ? dayjs.duration(duration)
            : dayjs(endTime)
          ).format(timeFormat)}
        </code>
      </div>
    </div>
  );
});
