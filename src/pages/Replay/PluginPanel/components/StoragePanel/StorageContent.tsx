import { StorageTable } from '@/components/StorageTable';
import { useReplayStore } from '@/store/replay';
import { useSocketMessageStore } from '@/store/socket-message';
import { useForceThrottleRender } from '@/utils/useForceRender';
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { memo, useEffect, useRef } from 'react';

interface Props {
  activeTab: SpyStorage.DataType;
}

export const StorageContent = memo(({ activeTab }: Props) => {
  const storageMsg = useRef(useReplayStore.getState().storageMsg);
  const { throttleRender } = useForceThrottleRender();
  useEffect(
    () =>
      useReplayStore.subscribe((state) => {
        storageMsg.current = state.storageMsg;
        throttleRender();
      }),
    [throttleRender],
  );

  return <StorageTable activeTab={activeTab} storageMsg={storageMsg.current} />;
});
