import { NetworkTable } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { useForceThrottleRender } from '@/utils/useForceRender';
import { memo, useEffect, useRef } from 'react';

export const NetworkPanel = memo(() => {
  const networkMsg = useRef(useReplayStore.getState().networkMsg);
  const { throttleRender } = useForceThrottleRender();

  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        if (networkMsg.current.length !== state.networkMsg.length) {
          networkMsg.current = state.networkMsg;
          throttleRender();
        }
      }),
    [throttleRender],
  );

  return <NetworkTable data={networkMsg.current} />;
});
