import { getSpyRoom } from '@/apis';
import { BROWSER_LOGO, OS_LOGO, resolveClientInfo } from '@/utils/brand';
import { useRequest } from 'ahooks';
import {
  Typography,
  Row,
  Col,
  message,
  Empty,
  Button,
  Tooltip,
  Input,
  Form,
  Select,
  Space,
} from 'antd';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const { Title } = Typography;
const { Option } = Select;

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

const filterConnections = (
  data: I.SpyRoom[],
  condition: Record<'address' | 'os' | 'browser', string>,
) => {
  const { address = '', os = '', browser = '' } = condition;
  return data
    .filter((i) => i.address.slice(0, 4).includes(address || ''))
    .filter(({ name }) => {
      const { osName, browserName } = resolveClientInfo(name);
      return osName.includes(os) && browserName.includes(browser);
    });
};

export const RoomList = () => {
  const [form] = Form.useForm();
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
      pollingErrorRetryCount: 0,
      onError(e) {
        message.error(e.message);
      },
    },
  );

  const [conditions, setConditions] = useState({
    address: '',
    os: '',
    browser: '',
  });
  const onFormFinish = useCallback((value) => {
    setConditions({
      address: value.address || '',
      os: value.os || '',
      browser: value.browser || '',
    });
  }, []);

  const mainContent = useMemo(() => {
    if (error || connectionList.length === 0)
      return (
        <Empty
          style={{
            marginTop: 60,
          }}
        />
      );

    const list = sortConnections(filterConnections(connectionList, conditions));

    return (
      <Row gutter={24}>
        {list.map(({ address, name, connections }) => {
          const { osLogo, browserLogo } = resolveClientInfo(name);
          const client = connections.find(({ userId }) => userId === 'Client');

          return (
            <Col key={address} span={8}>
              <Tooltip title={!client && t('socket.client-not-in-connection')}>
                <Row
                  justify="space-between"
                  align="middle"
                  className={clsx('connection-item', {
                    'no-client': !client,
                  })}
                  onClick={() => {
                    if (!client) return;

                    window.open(`/devtools?version=${name}&address=${address}`);
                  }}
                >
                  <Col>
                    <Tooltip title={t('common.device-id')}>
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
                        <img src={browserLogo} width="24" alt="browser logo" />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Tooltip>
            </Col>
          );
        })}
      </Row>
    );
  }, [conditions, connectionList, error, t]);

  return (
    <div className="room-list">
      <div className="room-list-content">
        <Title level={3} style={{ marginBottom: 12 }}>
          {t('common.connections')}
        </Title>
        <Form form={form} onFinish={onFormFinish}>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label={t('common.device-id')} name="address">
                <Input placeholder={t('common.device-id')!} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('common.os')} name="os">
                <Select placeholder={t('connections.select-os')} allowClear>
                  {Object.entries(OS_LOGO).map(([name, logo]) => {
                    return (
                      <Option value={name} key={name}>
                        <div className="flex-between">
                          <span>{name}</span>
                          <img src={logo} width="20" height="20" alt="" />
                        </div>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t('common.browser')} name="browser">
                <Select
                  placeholder={t('connections.select-browser')}
                  allowClear
                >
                  {Object.entries(BROWSER_LOGO).map(([name, logo]) => {
                    return (
                      <Option value={name} key={name}>
                        <div className="flex-between">
                          <span>{name}</span>
                          <img src={logo} width="20" height="20" alt="" />
                        </div>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Col>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {t('common.submit')}
                  </Button>
                  <Button
                    type="default"
                    onClick={() => {
                      form.resetFields();
                      form.submit();
                    }}
                  >
                    {t('common.reset')}
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {mainContent}
      </div>
    </div>
  );
};
