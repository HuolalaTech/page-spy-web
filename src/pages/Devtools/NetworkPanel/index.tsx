/* eslint-disable no-case-declarations */
import { Row, Col, Tooltip, Button, Input, Space } from 'antd';
import { memo, useRef, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ClearOutlined } from '@ant-design/icons';
import './index.less';
import { useTranslation } from 'react-i18next';
import { useSocketMessageStore } from '@/store/socket-message';
import { NetworkTable, NetworkType } from '@/components/NetworkTable';
import { ONLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';
import { debounce } from 'lodash-es';
import { TypeFilter } from '@/components/NetworkTable/TypeFilter';

const NetworkPanel = memo(() => {
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });

  const storeRef = useRef(useSocketMessageStore.getState());
  const clearRecord = useRef(storeRef.current.clearRecord);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterType, setFilterType] = useState<NetworkType>('All');

  const [networkMsg, storageMsg] = useSocketMessageStore(
    useShallow((state) => [state.networkMsg, state.storageMsg]),
  );

  const debounceFilter = debounce((e) => {
    setFilterKeyword(e.target.value);
  }, 300);

  return (
    <div className="network-panel">
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
      <div className="network-panel__content">
        <NetworkTable
          data={networkMsg}
          filterKeyword={filterKeyword}
          filterType={filterType}
          cookie={storageMsg.cookie}
          resizeCacheKey={ONLINE_NETWORK_CACHE}
        />
      </div>
    </div>
  );
});

export default NetworkPanel;
