import { NetworkTable } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';

export const NetworkPanel = () => {
  const networkMsg = useReplayStore((state) => state.networkMsg);

  return (
    <div className="replay-network-panel">
      <NetworkTable data={networkMsg} />
    </div>
  );
};
