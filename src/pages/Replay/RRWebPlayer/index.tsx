import { useEventListener } from '@/utils/useEventListener';
import { memo, useEffect, useMemo, useRef } from 'react';
import { PLAYER_SIZE_CHANGE, REPLAY_STATUS_CHANGE } from '../events';
import { useReplayStore } from '@/store/replay';
import rrwebPlayer from 'rrweb-player';
import './index.less';
import { useShallow } from 'zustand/react/shallow';

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
      },
    });
  }, [events]);

  return <div className="rrweb-player" ref={rootEl} />;
});
