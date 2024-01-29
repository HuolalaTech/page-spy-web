import { ConsoleItem } from '@/components/ConsoleItem';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { useEffect, useRef } from 'react';
import { useForceThrottleRender } from '@/utils/useForceRender';

export const ConsolePanel = () => {
  const consoleMsg = useRef(useReplayStore.getState().consoleMsg);
  const { throttleRender } = useForceThrottleRender();
  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        consoleMsg.current = state.consoleMsg;
        throttleRender();
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
};
