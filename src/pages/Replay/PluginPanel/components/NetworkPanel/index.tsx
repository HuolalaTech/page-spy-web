import { NetworkTable } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';

export const NetworkPanel = () => {
  const networkMsg = useReplayStore((state) => state.networkMsg);

  return <NetworkTable data={networkMsg} />;
};
