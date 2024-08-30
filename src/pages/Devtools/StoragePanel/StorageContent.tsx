import { StorageTable } from '@/components/StorageTable';
import { StorageType } from '@/store/platform-config';
import { useSocketMessageStore } from '@/store/socket-message';
import { memo } from 'react';
import { ONLINE_STORAGE_CACHE } from '@/components/ResizableTitle/cache-key';

interface Props {
  activeTab: StorageType;
}

export const StorageContent = memo(({ activeTab }: Props) => {
  const storageMsg = useSocketMessageStore((state) => state.storageMsg);

  return (
    <StorageTable
      activeTab={activeTab}
      storageMsg={storageMsg}
      resizeCacheKey={ONLINE_STORAGE_CACHE}
    />
  );
});
