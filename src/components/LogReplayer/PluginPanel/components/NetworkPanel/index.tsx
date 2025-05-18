import { NetworkTable, NetworkType, RESOURCE_TYPE } from '@/components/NetworkTable';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo, useCallback, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { OFFLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';
import { Input, Space, Dropdown, Button, Empty } from 'antd';
import { debounce } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useEventListener } from '@/utils/useEventListener';
import { TypeFilter } from '@/components/NetworkTable/TypeFilter';
import { FilterOutlined } from '@ant-design/icons';

const FILTER_KEYWORD_CHANGE = 'filter-keyword-change';
const FILTER_TYPE_CHANGE = 'filter-type-change';
export const NetworkActions = memo(() => {
  const { t } = useTranslation();
  // 只在PC端显示
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 如果是移动端，不显示菜单栏上的过滤器
  if (isMobile) {
    return null;
  }

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
  const { t } = useTranslation();
  const networkMsg = useReplayStore(useShallow((state) => state.networkMsg));
  const [filterKeyword, setFilterKeyword] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEventListener(FILTER_KEYWORD_CHANGE, (e: Event) => {
    const { detail } = e as CustomEvent;
    setFilterKeyword(detail);
  });

  const [filterType, setFilterType] = useState<NetworkType>('All');
  useEventListener(FILTER_TYPE_CHANGE, (e: Event) => {
    const { detail } = e as CustomEvent;
    setFilterType(detail);
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFilter = useCallback(
    debounce((e) => {
      setFilterKeyword(e.target.value);
    }, 300),
    [],
  );
  
  // 筛选菜单配置
  const filterMenu = {
    items: [...RESOURCE_TYPE.keys()].map(key => ({
      key,
      label: key
    })),
    selectable: true,
    selectedKeys: [filterType],
    onClick: ({ key }: { key: string }) => {
      setFilterType(key as NetworkType);
    }
  };

  return (
    <div className="replay-network-panel">
      {isMobile && (
        <div className="mobile-controls-wrapper">
          <Input
            size="middle"
            onChange={debounceFilter}
            placeholder={t('common.filter')!}
            allowClear={true}
            className="filter-input"
          />
          <Dropdown menu={filterMenu} trigger={['click']} placement="bottomLeft">
            <Button size="middle" className="filter-dropdown-btn">
              <FilterOutlined />
              <span>{filterType}</span>
            </Button>
          </Dropdown>
        </div>
      )}
      
      <div className="network-content">
        <NetworkTable
          data={networkMsg}
          filterKeyword={filterKeyword}
          filterType={filterType}
          resizeCacheKey={OFFLINE_NETWORK_CACHE}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
});
