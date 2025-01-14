import { OFFLINE_STORAGE_CACHE } from '@/components/ResizableTitle/cache-key';
import { StorageTable } from '@/components/StorageTable';
import { useReplayStore } from '@/store/replay';
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface Props {
  activeTab: SpyStorage.DataType;
}

export const StorageContent = memo(({ activeTab }: Props) => {
  const storageMsg = useReplayStore(useShallow((state) => state.storageMsg));

  return (
    <StorageTable
      activeTab={activeTab}
      storageMsg={storageMsg as any}
      resizeCacheKey={OFFLINE_STORAGE_CACHE}
    />
  );
});
