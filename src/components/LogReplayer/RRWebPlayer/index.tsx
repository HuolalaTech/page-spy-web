import { useEventListener } from '@/utils/useEventListener';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PLAYER_SIZE_CHANGE,
  REPLAY_PROGRESS_SKIP,
  REPLAY_STATUS_CHANGE,
} from '../events';
import { useReplayStore } from '@/store/replay';
import rrwebPlayer from 'rrweb-player';
import './index.less';
import { useShallow } from 'zustand/react/shallow';
import { ReplayerEvents } from '@rrweb/types';
import { isRRWebClickEvent, isRRWebMetaEvent } from '@/utils/rrweb-event';
import ClickEffectSvg from '@/assets/image/click-effect.svg?raw';
import clsx from 'clsx';
import { isMobile } from '@/utils/brand';
export const RRWebPlayer = memo(() => {
  const rootEl = useRef<HTMLDivElement | null>(null);
  const playerInstance = useRef<rrwebPlayer>();
  const [allRRwebEvent, speed, metaMsg, rrwebStartTime, setRRWebStartTime] =
    useReplayStore(
      useShallow((state) => [
        state.allRRwebEvent,
        state.speed,
        state.metaMsg,
        state.rrwebStartTime,
        state.setRRWebStartTime,
      ]),
    );

  const platformClass = useMemo(() => {
    return isMobile(metaMsg?.ua) ? 'is-mobile' : 'is-pc';
  }, [metaMsg]);

  const events = useMemo(() => {
    if (!allRRwebEvent.length) return [];
    return structuredClone(allRRwebEvent);
  }, [allRRwebEvent]);

  const onGoto = useCallback(() => {
    const player = playerInstance.current;
    if (!player) return;

    const { isPlaying, progress, duration } = useReplayStore.getState();

    let where = progress * duration;
    if (metaMsg?.startTime && metaMsg.startTime > rrwebStartTime) {
      where += metaMsg.startTime - rrwebStartTime;
    }

    player.goto(where, isPlaying);
  }, [metaMsg, rrwebStartTime]);

  useEventListener(REPLAY_STATUS_CHANGE, onGoto);
  useEventListener(REPLAY_PROGRESS_SKIP, onGoto);

  useEventListener(PLAYER_SIZE_CHANGE, () => {
    const { width, height } = rootEl.current!.getBoundingClientRect();
    (playerInstance.current as any)?.$set({
      width,
      height,
    });
    playerInstance.current?.triggerResize();
  });

  useEffect(() => {
    playerInstance.current?.setSpeed(speed);
  }, [speed]);

  const [isPc, setIsPc] = useState(true);
  useEffect(() => {
    const root = rootEl.current;
    if (!root || !events.length || playerInstance.current) return;

    const { width, height } = root.getBoundingClientRect();

    // eslint-disable-next-line new-cap
    playerInstance.current = new rrwebPlayer({
      target: root,
      props: {
        events,
        width,
        height,
        speed: 1,
        speedOption: [1],
        autoPlay: false,
        skipInactive: false,
        showController: false,
        mouseTail: {
          lineWidth: 3,
          strokeStyle: 'rgb(132, 52, 233)',
          duration: 400,
        },
        UNSAFE_replayCanvas: true,
        insertStyleRules: [
          `.click-effect {
            position: fixed;
            width: 40px;
            height: 40px;
            font-size: 12px;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 10000000;
          }`,
        ],
      },
    });
    const replayer = playerInstance.current.getReplayer();
    const { startTime } = replayer.getMetaData();

    setRRWebStartTime(startTime);
    const doc = replayer.iframe.contentDocument!;
    const clickEffect = document.createElement('div');
    clickEffect.classList.add('click-effect');
    clickEffect.innerHTML = ClickEffectSvg;

    replayer.on(ReplayerEvents.EventCast, (event) => {
      if (isRRWebMetaEvent(event)) {
        setIsPc(event.data.width > 820);
      }
      if (isRRWebClickEvent(event)) {
        const { x, y } = event.data;
        clickEffect.style.left = `${x}px`;
        clickEffect.style.top = `${y}px`;

        const appendDiv = doc.body.appendChild(clickEffect);

        setTimeout(() => {
          appendDiv.remove();
        }, 150);
      }
    });
  }, [events, setRRWebStartTime]);

  return <div className={clsx('rrweb-player', platformClass)} ref={rootEl} />;
});
