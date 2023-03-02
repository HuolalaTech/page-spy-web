import { SyncOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Col, Form, message, Modal, Row, Select, Space } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { withPopup } from '@/utils/withPopup';
import { resolveClientInfo } from '@/utils/brand';
import { getSpyRoom } from '@/apis';
import './index.less';

const { Option } = Select;

export const SelectRoomModal = withPopup(({ resolve, visible }) => {
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
      title="Select the connection"
      maskClosable
      bodyStyle={{
        paddingTop: 24,
      }}
      onCancel={resolve}
      okButtonProps={{ disabled: !connection }}
      onOk={onJoinRoom}
    >
      <Form
        labelCol={{
          span: 6,
        }}
      >
        <Form.Item label="Connections">
          <Row gutter={12}>
            <Col flex={1}>
              <Select
                placeholder="Select the connection"
                value={connection}
                onChange={setConnection}
                optionLabelProp="label"
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
                              src={info.osLogo}
                              alt={info.osName}
                              height={28}
                            />
                            <div className="browser-info">
                              <img
                                src={info.browserLogo}
                                alt={info.browserName}
                                height={28}
                              />
                              <p className="browser-info-version">
                                {info.browserVersion}
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
              <Button onClick={refreshConnections}>
                <SyncOutlined />
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
});
