import { ConsoleItem } from '@/components/ConsoleItem';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const ConsolePanel = memo(() => {
  const consoleMsg = useReplayStore(useShallow((state) => state.consoleMsg));

  return (
    <div className="console-panel">
      {consoleMsg.map((data) => (
        <ConsoleItem data={data} key={data.id} />
      ))}
    </div>
  );
});
