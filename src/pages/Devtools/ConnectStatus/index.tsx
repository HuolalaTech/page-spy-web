import { SpySocket } from '@huolala-tech/page-spy-types';
import { Row, Col, Space, Divider } from 'antd';
import { memo, useEffect, useState } from 'react';
import './index.less';
import UserSvg from '@/assets/image/user-1.svg?react';
import Icon from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSocketMessageStore } from '@/store/socket-message';
import { CUSTOM_EVENT } from '@/store/socket-message/socket';
import { useShallow } from 'zustand/react/shallow';

interface ConnectionStatus {
  client?: SpySocket.Connection | null;
  debug?: SpySocket.Connection | null;
}

const UserStatus = ({ online }: { online: boolean }) => {
  return (
    <Icon
      component={UserSvg}
      style={{
        color: online ? '#2fbf2f' : '#aaa',
        fontSize: 16,
      }}
    />
  );
};

export const ConnectStatus = memo(() => {
  const { t } = useTranslation();
  const socket = useSocketMessageStore(useShallow((state) => state.socket));
  const [connections, setConnections] = useState<ConnectionStatus>(() => ({
    client: socket?.clientConnection,
    debug: socket?.socketConnection,
  }));

  useEffect(() => {
    if (!socket) return;
    const statusListener: EventListener = (evt) => {
      const { detail } = evt as CustomEvent<ConnectionStatus>;
      setConnections(detail);
    };
    socket.addEventListener(CUSTOM_EVENT.ConnectStatus, statusListener);
    return () => {
      socket.removeEventListener(CUSTOM_EVENT.ConnectStatus, statusListener);
    };
  }, [socket]);

  return (
    <Row justify="center" className="connect-status">
      <Col>
        <div className="connect-status-widget">
          <Space>
            <Space>
              <UserStatus online={!!connections.debug} />
              {t('socket.debug-name')}
            </Space>
            <Divider type="vertical" />
            <Space>
              <UserStatus online={!!connections.client} />
              {t('socket.client-name')}
            </Space>
          </Space>
        </div>
      </Col>
    </Row>
  );
});
