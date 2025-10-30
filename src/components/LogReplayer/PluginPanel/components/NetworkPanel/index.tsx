import { NetworkTable } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { OFFLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';
import { Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { TypeFilter } from '@/components/NetworkTable/TypeFilter';

export const NetworkActions = memo(() => {
  const { t } = useTranslation();
  const [networkKeyword, setNetworkKeyword, networkType, setNetworkType] =
    useReplayStore(
      useShallow((state) => [
        state.networkKeyword,
        state.setNetworkKeyword,
        state.networkType,
        state.setNetworkType,
      ]),
    );

  return (
    <Space>
      <Input
        value={networkKeyword}
        onChange={(e) => {
          setNetworkKeyword(e.target.value);
        }}
        placeholder={t('common.filter')!}
        allowClear={true}
        style={{ width: 140 }}
        size="small"
      />
      <TypeFilter
        size="small"
        value={networkType}
        onChange={(type) => {
          setNetworkType(type);
        }}
      />
    </Space>
  );
});

export const NetworkPanel = memo(() => {
  const networkMsg = useReplayStore(useShallow((state) => state.networkMsg));

  const [networkKeyword, networkType] = useReplayStore(
    useShallow((state) => [state.networkKeyword, state.networkType]),
  );
  return (
    <NetworkTable
      data={networkMsg}
      filterKeyword={networkKeyword}
      filterType={networkType}
      resizeCacheKey={OFFLINE_NETWORK_CACHE}
    />
  );
});
