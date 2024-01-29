import { useEventListener } from '@/utils/useEventListener';
import { memo, useEffect, useMemo, useRef } from 'react';
import { REPLAY_STATUS_CHANGE } from '../events';
import { useReplayStore } from '@/store/replay';
import rrwebPlayer from 'rrweb-player';
import './index.less';

export const RRWebPlayer = memo(() => {
  const rootEl = useRef<HTMLDivElement | null>(null);
  const playerInstance = useRef<rrwebPlayer>();
  const allRRwebEvent = useReplayStore((state) => state.allRRwebEvent);

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
      },
    });
  }, [events]);

  return <div className="rrweb-player" ref={rootEl} />;
});
