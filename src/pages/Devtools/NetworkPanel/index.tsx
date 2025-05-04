/* eslint-disable no-case-declarations */
import { Row, Col, Tooltip, Button, Input, Space, Dropdown, MenuProps } from 'antd';
import { memo, useRef, useMemo, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ClearOutlined, MenuOutlined, FilterOutlined } from '@ant-design/icons';
import './index.less';
import { useTranslation } from 'react-i18next';
import { useSocketMessageStore } from '@/store/socket-message';
import { NetworkTable, NetworkType, RESOURCE_TYPE } from '@/components/NetworkTable';
import { ONLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';
import { debounce } from 'lodash-es';
import { TypeFilter } from '@/components/NetworkTable/TypeFilter';

const NetworkPanel = memo(() => {
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });

  const storeRef = useRef(useSocketMessageStore.getState());
  const clearRecord = useRef(storeRef.current.clearRecord);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterType, setFilterType] = useState<NetworkType>('All');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [networkMsg, storageMsg] = useSocketMessageStore(
    useShallow((state) => [state.networkMsg, state.storageMsg]),
  );

  const debounceFilter = debounce((e) => {
    setFilterKeyword(e.target.value);
  }, 300);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 下拉筛选菜单
  const filterMenu: MenuProps = {
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
    <div className="network-panel">
      {isMobile ? (
        <div className="mobile-controls-wrapper">
          <Input
            size="middle"
            onChange={debounceFilter}
            placeholder={ct('filter')!}
            allowClear={true}
            className="filter-input"
          />
          <Dropdown menu={filterMenu} trigger={['click']} placement="bottomLeft">
            <Button size="middle" className="filter-dropdown-btn">
              <FilterOutlined />
              <span>{filterType}</span>
            </Button>
          </Dropdown>
          <Tooltip title={ct('clear')}>
            <Button 
              size="middle"
              onClick={() => clearRecord.current!('network')}
              icon={<ClearOutlined />}
              className="clear-btn"
            />
          </Tooltip>
        </div>
      ) : (
        <Row justify="end">
          <Col>
            <Space>
              <Input
                onChange={debounceFilter}
                placeholder={ct('filter')!}
                allowClear={true}
                style={{ width: 200 }}
              />
              <TypeFilter onChange={setFilterType} />
              <Tooltip title={ct('clear')}>
                <Button onClick={() => clearRecord.current!('network')}>
                  <ClearOutlined />
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      )}
      <div className="network-panel__content">
        <NetworkTable
          data={networkMsg}
          filterKeyword={filterKeyword}
          filterType={filterType}
          cookie={storageMsg.cookie}
          resizeCacheKey={ONLINE_NETWORK_CACHE}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
});

export default NetworkPanel;
