/* eslint-disable no-case-declarations */
import { Row, Col, Tooltip, Button, Input, Select, Space } from 'antd';
import { memo, useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { ClearOutlined } from '@ant-design/icons';
import './index.less';
import { useTranslation } from 'react-i18next';
import { useSocketMessageStore } from '@/store/socket-message';
import { NetworkTable } from '@/components/NetworkTable';
import { useForceThrottleRender } from '@/utils/useForceRender';
import { ONLINE_NETWORK_CACHE } from '@/components/ResizableTitle/cache-key';
import { debounce } from 'lodash-es';

const NetworkPanel = memo(() => {
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });

  const storeRef = useRef(useSocketMessageStore.getState());
  const [networkMsg, setNetworkMsg] = useState(storeRef.current.networkMsg);
  const storageMsg = useRef(storeRef.current.storageMsg);
  const clearRecord = useRef(storeRef.current.clearRecord);
  const { throttleRender } = useForceThrottleRender();
  const [selectedRequestNames, setSelectedRequestNames] = useState<string[]>(
    [],
  );
  const [networkKeyWord, setNetworkKeyWord] = useState('');

  useEffect(
    () =>
      useSocketMessageStore.subscribe((state) => {
        setNetworkMsg(state.networkMsg);
        storageMsg.current = state.storageMsg;
        throttleRender();
      }),
    [throttleRender],
  );

  const RequestNameList = useMemo(() => {
    return networkMsg.map((option) => ({
      label: (
        <div className="select-item">
          <span className="select-item label-text">{option.pathname}</span>
        </div>
      ),
      value: option.pathname,
    }));
  }, [networkMsg]);

  const changeRequestNameFilter = (selectedNames: string[]) => {
    setSelectedRequestNames(selectedNames);
  };

  const filteredNetworkMsg = useMemo(() => {
    if (selectedRequestNames.length === 0 && networkKeyWord.length === 0) {
      return networkMsg;
    }

    return networkMsg.filter((msg) => {
      const matchesName =
        selectedRequestNames.length === 0 ||
        selectedRequestNames.includes(msg.pathname);
      const matchesKeyword =
        networkKeyWord.length === 0 || msg.pathname.includes(networkKeyWord);

      return matchesName && matchesKeyword;
    });
  }, [networkKeyWord, networkMsg, selectedRequestNames]);

  const debounceKeywordFilter = useCallback(
    debounce((e) => {
      console.log(e.target.value, 'e.target.value)');
      setNetworkKeyWord(e.target.value);
    }, 300),
    [],
  );

  return (
    <div className="network-panel">
      <Row justify="end">
        <Col>
          <Space>
            <Select
              onChange={changeRequestNameFilter}
              maxTagCount="responsive"
              mode="multiple"
              allowClear={true}
              options={RequestNameList}
              placeholder="Request Name Filter"
              style={{ width: 200 }}
            />
            <Input
              onChange={debounceKeywordFilter}
              placeholder="Keyword Filter"
              allowClear={true}
              style={{ width: 200 }}
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
          cookie={storageMsg.current.cookie}
          resizeCacheKey={ONLINE_NETWORK_CACHE}
        />
      </div>
    </div>
  );
});

export default NetworkPanel;
