import { SyncOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Col, Form, message, Modal, Row, Select, Space } from 'antd';
import { useCallback, useState } from 'react';
import { withPopup } from '@/utils/withPopup';
import { resolveClientInfo } from '@/utils/brand';
import { getSpyRoom } from '@/apis';
import './index.less';

const { Option } = Select;

export const SelectRoomModal = withPopup(({ resolve, visible }) => {
  const [group, setGroup] = useState<string>();
  const { data: groupList = [], refresh: refreshGroups } = useRequest(() =>
    Promise.resolve([
      {
        label: 'page-spy-dev',
        value: 'page-spy-dev',
      },
    ]),
  );

  const [connection, setConnection] = useState<string>();
  const { data: connectionList = [], refresh: refreshConnections } = useRequest(
    async () => {
      const res = await getSpyRoom(group!);
      return res.data;
    },
    {
      ready: !!group,
      refreshDeps: [group],
    },
  );

  const onJoinRoom = useCallback(() => {
    const room = connectionList.find((i) => i.address === connection);
    if (!room) {
      message.error('No room matched error');
      return;
    }
    window.open(
      `/devtools?group=${group}&version=${room.name}&address=${room.address}`,
    );
  }, [connection, connectionList, group]);

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
        <Form.Item label="Group">
          <Row gutter={12}>
            <Col flex={1}>
              <Select
                value={group}
                onChange={(v) => {
                  setGroup(v);
                  setConnection('');
                }}
                placeholder="Select the group"
                options={groupList}
              />
            </Col>
            <Col>
              <Button onClick={refreshGroups}>
                <SyncOutlined />
              </Button>
            </Col>
          </Row>
        </Form.Item>
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
                          <Space className="connection">
                            <img
                              src={info.osLogo}
                              alt={info.osName}
                              height={26}
                            />
                            <div className="browser-info">
                              <img
                                src={info.browserLogo}
                                alt={info.browserName}
                                height={40}
                              />
                              <span className="browser-info-version">
                                {info.browserVersion}
                              </span>
                            </div>
                          </Space>
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
