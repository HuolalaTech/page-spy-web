import { useEventListener } from '@/utils/useEventListener';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { isRRWebClickEvent } from '@/utils';

const ClickEffectSvg = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="42" fill="none" stroke="white" stroke-width="2"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="black" stroke-width="4"/>
    <circle cx="50" cy="50" r="48" fill="none" stroke="white" stroke-width="2"/>
  </svg>
`;

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

  const events = useMemo(() => {
    if (!allRRwebEvent.length) return [];
    return JSON.parse(JSON.stringify(allRRwebEvent));
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
          lineWidth: 5,
          strokeStyle: 'rgb(132, 52, 233)',
        },
        UNSAFE_replayCanvas: true,
        insertStyleRules: [
          `.click-effect {
            position: fixed;
            width: 50px;
            height: 50px;
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
    const div = document.createElement('div');
    div.classList.add('click-effect');
    div.innerHTML = ClickEffectSvg;

    replayer.on(ReplayerEvents.EventCast, (event) => {
      if (isRRWebClickEvent(event)) {
        const { x, y } = event.data;
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;

        const appendDiv = doc.body.appendChild(div);

        setTimeout(() => {
          appendDiv.remove();
        }, 150);
      }
    });
  }, [events, setRRWebStartTime]);

  return <div className="rrweb-player" ref={rootEl} />;
});
