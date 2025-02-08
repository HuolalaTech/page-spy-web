/* eslint-disable no-case-declarations */
import {
  Row,
  Col,
  Tooltip,
  Button,
  Input,
  Space,
  Radio,
  RadioChangeEvent,
} from 'antd';
import { memo, useRef, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ClearOutlined } from '@ant-design/icons';
import './index.less';
import { useTranslation } from 'react-i18next';
import { useSocketMessageStore } from '@/store/socket-message';
import { NetworkTable } from '@/components/NetworkTable';
import { ONLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';
import { debounce } from 'lodash-es';
import { SpyNetwork } from '@huolala-tech/page-spy-types';

const RESOURCE_TYPE: Map<string, (type: SpyNetwork.RequestType) => boolean> =
  new Map([
    ['All', (type) => /.*/.test(type)],
    [
      'Fetch',
      (type) => /(fetch|xhr|mp-request|mp-upload|eventsource)/.test(type),
    ],
    ['CSS', (type) => /css/.test(type)],
    ['JS', (type) => /script/.test(type)],
    ['Img', (type) => /img/.test(type)],
    ['Media', (type) => /(audio|video)/.test(type)],
    [
      'Other',
      (type) =>
        !/(fetch|xhr|mp-request|mp-upload|eventsource|css|script|img|audio|video)/.test(
          type,
        ),
    ],
  ]);

const NetworkPanel = memo(() => {
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });

  const storeRef = useRef(useSocketMessageStore.getState());
  const clearRecord = useRef(storeRef.current.clearRecord);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterType, setFilterType] = useState('Fetch');

  const [networkMsg, storageMsg] = useSocketMessageStore(
    useShallow((state) => [state.networkMsg, state.storageMsg]),
  );

  const filteredNetworkMsg = useMemo(() => {
    const keyword = filterKeyword.trim().toLocaleLowerCase();
    if (!keyword && filterType === 'All') {
      return networkMsg;
    }

    return networkMsg.filter(
      (msg) =>
        RESOURCE_TYPE.get(filterType)?.(msg.requestType) &&
        msg.url.toLocaleLowerCase().includes(keyword),
    );
  }, [filterKeyword, filterType, networkMsg]);

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
            <Radio.Group
              optionType="button"
              options={[...RESOURCE_TYPE.keys()].map((key) => {
                return { value: key, label: key };
              })}
              value={filterType}
              onChange={({ target: { value } }: RadioChangeEvent) => {
                setFilterType(value);
              }}
            />
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
          data={filteredNetworkMsg}
          cookie={storageMsg.cookie}
          resizeCacheKey={ONLINE_NETWORK_CACHE}
        />
      </div>
    </div>
  );
});

export default NetworkPanel;
