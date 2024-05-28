import { ConsoleItem } from '@/components/ConsoleItem';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo, useEffect, useRef } from 'react';
import { useForceThrottleRender } from '@/utils/useForceRender';

export const ConsolePanel = memo(() => {
  const consoleMsg = useRef(useReplayStore.getState().consoleMsg);
  const { throttleRender } = useForceThrottleRender();
  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        if (consoleMsg.current.length !== state.consoleMsg.length) {
          consoleMsg.current = state.consoleMsg;
          throttleRender();
        }
      }),
    [throttleRender],
  );

  return (
    <div className="console-panel">
      {consoleMsg.current.map((data) => (
        <ConsoleItem data={data} key={data.id} />
      ))}
    </div>
  );
});
