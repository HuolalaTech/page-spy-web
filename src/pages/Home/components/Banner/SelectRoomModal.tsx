import { getSpyRoom } from '@/apis';
import { withPopup } from '@/utils/withPopup';
import { useRequest } from 'ahooks';
import { Button, Form, Modal, Select } from 'antd';
import { useCallback, useState } from 'react';

const { Option } = Select;

export const SelectRoomModal = withPopup(({ resolve, visible }) => {
  const [group, setGroup] = useState<string>();
  const {
    data: groupList = [],
    error,
    loading,
  } = useRequest(() =>
    Promise.resolve([
      {
        label: 'page-spy-dev',
        value: 'page-spy-dev',
      },
    ]),
  );

  const [connection, setConnection] = useState<string>();
  const { data: connectionList = [] } = useRequest(
    async () => {
      const res = await getSpyRoom(group!);
      return res.data;
    },
    {
      ready: !!group,
      refreshDeps: [group],
    },
  );

  const onJoinRoom = useCallback(() => {}, []);

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
          <Select
            value={group}
            onChange={(v) => {
              setGroup(v);
              setConnection('');
            }}
            placeholder="Select the group"
            options={groupList}
          />
        </Form.Item>
        <Form.Item label="Connections">
          <Select
            placeholder="Select the connection"
            value={connection}
            onChange={setConnection}
            optionLabelProp="label"
          >
            {connectionList.map(({ name, address }) => {
              return (
                <Option key={address} value={address}>
                  <span>{name}</span>
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
});
