import { NetworkTable } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { useForceThrottleRender } from '@/utils/useForceRender';
import { useEffect, useRef } from 'react';

export const NetworkPanel = () => {
  const networkMsg = useRef(useReplayStore.getState().networkMsg);
  const { throttleRender } = useForceThrottleRender();

  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        networkMsg.current = state.networkMsg;
        throttleRender();
      }),
    [throttleRender],
  );

  return <NetworkTable data={networkMsg.current} />;
};
