import { StorageTable } from '@/components/StorageTable';
import { useSocketMessageStore } from '@/store/socket-message';
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { memo } from 'react';

interface Props {
  activeTab: SpyStorage.DataType;
}

export const StorageContent = memo(({ activeTab }: Props) => {
  const storageMsg = useSocketMessageStore((state) => state.storageMsg);
  return <StorageTable activeTab={activeTab} storageMsg={storageMsg} />;
});
