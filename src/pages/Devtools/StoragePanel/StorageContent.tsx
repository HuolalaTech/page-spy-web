import { StorageTable } from '@/components/StorageTable';
import { StorageType } from '@/store/platform-config';
import { useSocketMessageStore } from '@/store/socket-message';
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { memo } from 'react';

interface Props {
  activeTab: StorageType;
}

export const StorageContent = memo(({ activeTab }: Props) => {
  const storageMsg = useSocketMessageStore((state) => state.storageMsg);
  return <StorageTable activeTab={activeTab} storageMsg={storageMsg} />;
});
