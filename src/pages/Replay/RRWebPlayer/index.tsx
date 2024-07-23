import { useEventListener } from '@/utils/useEventListener';
import { memo, useEffect, useMemo, useRef } from 'react';
import { PLAYER_SIZE_CHANGE, REPLAY_STATUS_CHANGE } from '../events';
import { useReplayStore } from '@/store/replay';
import rrwebPlayer from 'rrweb-player';
import './index.less';
import { useShallow } from 'zustand/react/shallow';
import {
  EventType,
  incrementalSnapshotEvent,
  IncrementalSource,
  MouseInteractions,
  ReplayerEvents,
} from '@rrweb/types';

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
  const [allRRwebEvent, speed] = useReplayStore(
    useShallow((state) => [state.allRRwebEvent, state.speed]),
  );

  const events = useMemo(() => {
    if (!allRRwebEvent.length) return [];
    return JSON.parse(JSON.stringify(allRRwebEvent));
  }, [allRRwebEvent]);

  useEventListener(REPLAY_STATUS_CHANGE, (evt) => {
    const { status, elapsed } = (evt as CustomEvent).detail;
    const player = playerInstance.current;
    if (!player) return;

    player.goto(elapsed, status === 'playing');
  });

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
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 10000000;
          }`,
        ],
      },
    });
    const replayer = playerInstance.current.getReplayer();
    const doc = replayer.iframe.contentDocument!;
    const div = document.createElement('div');
    div.classList.add('click-effect');
    div.innerHTML = ClickEffectSvg;

    replayer.on(ReplayerEvents.EventCast, (event) => {
      const { type, data } = event as incrementalSnapshotEvent;
      if (
        type === EventType.IncrementalSnapshot &&
        data.source === IncrementalSource.MouseInteraction &&
        data.type === MouseInteractions.Click
      ) {
        const { x, y } = data;
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;

        const appendDiv = doc.body.appendChild(div);

        setTimeout(() => {
          appendDiv.remove();
        }, 150);
      }
    });
  }, [events]);

  return <div className="rrweb-player" ref={rootEl} />;
});
