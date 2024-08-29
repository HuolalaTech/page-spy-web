/* eslint-disable no-case-declarations */
import { Button, Col, Row, Tooltip } from 'antd';
import { memo, useEffect, useRef } from 'react';
import { ClearOutlined } from '@ant-design/icons';
import './index.less';
import { useTranslation } from 'react-i18next';
import { useSocketMessageStore } from '@/store/socket-message';
import { NetworkTable } from '@/components/NetworkTable';
import { useForceThrottleRender } from '@/utils/useForceRender';

const NetworkPanel = memo(() => {
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });

  const storeRef = useRef(useSocketMessageStore.getState());
  const networkMsg = useRef(storeRef.current.networkMsg);
  const storageMsg = useRef(storeRef.current.storageMsg);
  const clearRecord = useRef(storeRef.current.clearRecord);
  const { throttleRender } = useForceThrottleRender();

  useEffect(
    () =>
      useSocketMessageStore.subscribe((state) => {
        networkMsg.current = state.networkMsg;
        storageMsg.current = state.storageMsg;
        throttleRender();
      }),
    [throttleRender],
  );

  return (
    <div className="network-panel">
      <Row justify="end">
        <Col>
          <Tooltip title={ct('clear')}>
            <Button onClick={() => clearRecord.current!('network')}>
              <ClearOutlined />
            </Button>
          </Tooltip>
        </Col>
      </Row>
      <div className="network-panel__content">
        <NetworkTable
          data={networkMsg.current}
          cookie={storageMsg.current.cookie}
          resizeCacheKey="online:pagespy-network-table-resize-config"
        />
      </div>
    </div>
  );
});

export default NetworkPanel;
