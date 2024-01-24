import { ConsoleItem } from '@/components/ConsoleItem';
import { useReplayStore } from '@/store/replay';
import './index.less';

export const ConsolePanel = () => {
  const consoleMsg = useReplayStore((state) => state.consoleMsg);
  return (
    <div className="console-panel">
      {consoleMsg.map((data) => (
        <ConsoleItem data={data} key={data.id} />
      ))}
    </div>
  );
};
