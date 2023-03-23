import { SyncOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Col, Form, message, Modal, Row, Select, Space } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { withPopup } from '@/utils/withPopup';
import { resolveClientInfo } from '@/utils/brand';
import { getSpyRoom } from '@/apis';
import './index.less';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

export const SelectRoomModal = withPopup(({ resolve, visible }) => {
  const { t } = useTranslation();
  const [connection, setConnection] = useState<string>();
  const {
    data: connectionList = [],
    refresh: refreshConnections,
    cancel: cancelPolling,
  } = useRequest(
    async () => {
      const defaultGroup = 'default';
      const res = await getSpyRoom(defaultGroup);
      return res.data;
    },
    {
      manual: true,
      pollingInterval: 3000,
      pollingWhenHidden: false,
    },
  );

  useEffect(() => {
    if (visible) {
      refreshConnections();
    } else {
      cancelPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const onJoinRoom = useCallback(() => {
    const room = connectionList.find((i) => i.address === connection);
    if (!room) {
      message.error('No room matched error');
      return;
    }
    window.open(`/devtools?version=${room.name}&address=${room.address}`);
  }, [connection, connectionList]);

  return (
    <Modal
      open={visible}
      title={t('selConn.title')}
      maskClosable
      bodyStyle={{
        paddingTop: 24,
      }}
      onCancel={resolve}
      okButtonProps={{ disabled: !connection }}
      onOk={onJoinRoom}
    >
      <Form
        size="large"
        labelCol={{
          span: 6,
        }}
      >
        <Form.Item label={t('selConn.label')}>
          <Row gutter={12} align="middle">
            <Col flex={1}>
              <Select
                showSearch
                size="large"
                placeholder={t('selConn.placeholder')}
                value={connection}
                onChange={setConnection}
                optionFilterProp="label"
              >
                {connectionList.map(({ name, address }) => {
                  const info = resolveClientInfo(name);

                  const simpleAddress = address.slice(0, 4);
                  return (
                    <Option key={address} value={address} label={simpleAddress}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <code className="address-info">{simpleAddress}</code>
                        </Col>
                        <Col>
                          <div className="device-system">
                            <img
                              alt={info.osName}
                              title={info.osName}
                              src={info.osLogo}
                              height={28}
                            />
                            <div className="browser-info">
                              <img
                                alt={info.browserName}
                                title={info.browserName}
                                src={info.browserLogo}
                                height={28}
                              />
                              <p className="browser-info-version">
                                {info.browserVersion.split('.')[0]}
                              </p>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Option>
                  );
                })}
              </Select>
            </Col>
            <Col>
              <Button size="large" onClick={refreshConnections}>
                <SyncOutlined />
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
});
