import { NetworkTable } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { OFFLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';

export const NetworkPanel = memo(() => {
  const networkMsg = useReplayStore(useShallow((state) => state.networkMsg));

  return (
    <NetworkTable data={networkMsg} resizeCacheKey={OFFLINE_NETWORK_CACHE} />
  );
});
