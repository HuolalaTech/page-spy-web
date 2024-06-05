import { NetworkTable } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const NetworkPanel = memo(() => {
  const networkMsg = useReplayStore(useShallow((state) => state.networkMsg));

  return <NetworkTable data={networkMsg} />;
});
