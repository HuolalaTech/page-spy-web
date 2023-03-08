import { SpySocket } from '@huolala-tech/page-spy';
import { Row, Col, Space, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { useWSInfo } from '../WSInfo';
import './index.less';
import { ReactComponent as UserSvg } from '@/assets/image/user-1.svg';
import Icon from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ConnectionStatus {
  client: SpySocket.Connection | null;
  debug: SpySocket.Connection | null;
}

const statusColor = (online: boolean) => {
  return online ? '#2fbf2f' : '#aaa';
};

export const ConnectStatus = () => {
  const { t } = useTranslation();
  const { socket } = useWSInfo();
  const [connections, setConnections] = useState<ConnectionStatus>({
    client: null,
    debug: null,
  });

  useEffect(() => {
    if (!socket) return;
    const statusListener: EventListener = (evt) => {
      const { detail } = evt as CustomEvent<ConnectionStatus>;
      setConnections(detail);
    };
    socket.addEventListener('connect-status', statusListener);
    return () => {
      socket.removeEventListener('connect-status', statusListener);
    };
  }, [socket]);

  return (
    <Row justify="center" className="connect-status">
      <Col>
        <div className="connect-status-widget">
          <Space>
            <Space>
              <Icon
                component={UserSvg}
                style={{
                  color: statusColor(!!connections.debug),
                  fontSize: 16,
                }}
              />
              {t('socket.debug-name')}
            </Space>
            <Divider type="vertical" />
            <Space>
              <Icon
                component={UserSvg}
                style={{
                  color: statusColor(!!connections.client),
                  fontSize: 16,
                }}
              />
              {t('socket.client-name')}
            </Space>
          </Space>
        </div>
      </Col>
    </Row>
  );
};
