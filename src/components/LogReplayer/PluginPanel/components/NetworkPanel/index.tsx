import { NetworkTable } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { OFFLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';
import { Input } from 'antd';
import { debounce } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useEventListener } from '@/utils/useEventListener';

const FILTER_CHANGE = 'filter-change';
export const NetworkActions = memo(() => {
  const { t } = useTranslation();

  const debounceFilter = useCallback(
    debounce((e) => {
      window.dispatchEvent(
        new CustomEvent(FILTER_CHANGE, {
          detail: e.target.value,
        }),
      );
    }, 300),
    [],
  );
  return (
    <Input
      onChange={debounceFilter}
      placeholder={t('common.filter')!}
      allowClear={true}
      style={{ width: 200 }}
    />
  );
});

export const NetworkPanel = memo(() => {
  const networkMsg = useReplayStore(useShallow((state) => state.networkMsg));
  const [filterKeyword, setFilterKeyword] = useState('');
  const filteredNetworkMsg = useMemo(() => {
    const keyword = filterKeyword.trim().toLocaleLowerCase();
    if (!keyword) {
      return networkMsg;
    }

    return networkMsg.filter((msg) =>
      msg.url.toLocaleLowerCase().includes(keyword),
    );
  }, [filterKeyword, networkMsg]);
  useEventListener(FILTER_CHANGE, (e: Event) => {
    const { detail } = e as CustomEvent;
    setFilterKeyword(detail);
  });

  return (
    <NetworkTable
      data={filteredNetworkMsg}
      resizeCacheKey={OFFLINE_NETWORK_CACHE}
    />
  );
});
