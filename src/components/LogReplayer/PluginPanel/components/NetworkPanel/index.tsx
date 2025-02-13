import { NetworkTable, NetworkType } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { OFFLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';
import { Input, Space } from 'antd';
import { debounce } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useEventListener } from '@/utils/useEventListener';
import { TypeFilter } from '@/components/NetworkTable/TypeFilter';

const FILTER_KEYWORD_CHANGE = 'filter-keyword-change';
const FILTER_TYPE_CHANGE = 'filter-type-change';
export const NetworkActions = memo(() => {
  const { t } = useTranslation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFilter = useCallback(
    debounce((e) => {
      window.dispatchEvent(
        new CustomEvent(FILTER_KEYWORD_CHANGE, {
          detail: e.target.value,
        }),
      );
    }, 300),
    [],
  );
  return (
    <Space>
      <Input
        onChange={debounceFilter}
        placeholder={t('common.filter')!}
        allowClear={true}
        style={{ width: 140 }}
        size="small"
      />
      <TypeFilter
        size="small"
        onChange={(type) => {
          window.dispatchEvent(
            new CustomEvent(FILTER_TYPE_CHANGE, {
              detail: type,
            }),
          );
        }}
      />
    </Space>
  );
});

export const NetworkPanel = memo(() => {
  const networkMsg = useReplayStore(useShallow((state) => state.networkMsg));
  const [filterKeyword, setFilterKeyword] = useState('');
  useEventListener(FILTER_KEYWORD_CHANGE, (e: Event) => {
    const { detail } = e as CustomEvent;
    setFilterKeyword(detail);
  });

  const [filterType, setFilterType] = useState<NetworkType>('All');
  useEventListener(FILTER_TYPE_CHANGE, (e: Event) => {
    const { detail } = e as CustomEvent;
    setFilterType(detail);
  });

  return (
    <NetworkTable
      data={networkMsg}
      filterKeyword={filterKeyword}
      filterType={filterType}
      resizeCacheKey={OFFLINE_NETWORK_CACHE}
    />
  );
});
