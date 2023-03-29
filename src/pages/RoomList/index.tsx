import { getSpyRoom } from '@/apis';
import { resolveClientInfo } from '@/utils/brand';
import { ReloadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Typography, Row, Col, message, Empty, Button, Tooltip } from 'antd';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const { Title } = Typography;

const sortConnections = (data: I.SpyRoom[]) => {
  const [valid, invalid] = (data || []).reduce(
    (acc, cur) => {
      const hasClient =
        cur.connections.findIndex((i) => i.userId === 'Client') > -1;
      if (hasClient) acc[0].push(cur);
      else acc[1].push(cur);
      return acc;
    },
    [[], []] as I.SpyRoom[][],
  );

  return [...valid, ...invalid];
};

export const RoomList = () => {
  const { t } = useTranslation();

  const {
    data: connectionList = [],
    error,
    refresh: refreshConnections,
  } = useRequest(
    async () => {
      const defaultGroup = 'default';
      const res = await getSpyRoom(defaultGroup);
      return res.data;
    },
    {
      pollingInterval: 5000,
      pollingWhenHidden: false,
    },
  );

  const mainContent = useMemo(() => {
    if (error) {
      message.error(error.message);
      return null;
    }
    if (connectionList.length === 0)
      return (
        <Empty
          description="No connections"
          style={{
            marginTop: 60,
          }}
        />
      );

    return (
      <Row gutter={24}>
        {sortConnections(connectionList).map(
          ({ address, name, connections }) => {
            const { osLogo, browserLogo } = resolveClientInfo(name);
            const client = connections.find(
              ({ userId }) => userId === 'Client',
            );

            return (
              <Col key={address} span={8}>
                <Tooltip
                  title={!client && t('socket.client-not-in-connection')}
                >
                  <Row
                    justify="space-between"
                    align="middle"
                    className={clsx('connection-item', {
                      'no-client': !client,
                    })}
                    onClick={() => {
                      if (!client) return;

                      window.open(
                        `/devtools?version=${name}&address=${address}`,
                      );
                    }}
                  >
                    <Col>
                      <Tooltip title="Device ID">
                        <Title level={3} style={{ marginBottom: 0 }}>
                          {address.slice(0, 4)}
                        </Title>
                      </Tooltip>
                    </Col>
                    <Col>
                      <div className="connection-item__system">
                        <div>
                          <span>OS:</span>
                          <img src={osLogo} width="24" alt="os logo" />
                        </div>
                        <div>
                          <span>Browser: </span>
                          <img
                            src={browserLogo}
                            width="24"
                            alt="browser logo"
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Tooltip>
              </Col>
            );
          },
        )}
      </Row>
    );
  }, [connectionList, error]);

  return (
    <div className="room-list">
      <Row justify="center">
        <Col span={16}>
          <Row
            justify="space-between"
            align="middle"
            style={{ marginTop: 60, marginBottom: 32 }}
          >
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Connections
              </Title>
            </Col>
            <Col>
              <Button onClick={refreshConnections}>
                <ReloadOutlined />
                Refresh
              </Button>
            </Col>
          </Row>
          {mainContent}
        </Col>
      </Row>
    </div>
  );
};
