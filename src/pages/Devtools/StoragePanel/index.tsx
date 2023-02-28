import type { SpyStorage } from '@huolala-tech/page-spy';
import { Layout, Menu, Table } from 'antd';
import { useMemo, useState } from 'react';
import { TypeNode } from '../TypeNode';
import { useWSInfo } from '../WSInfo';
import './index.less';

const { Sider, Content } = Layout;
const { Column } = Table;

export const StoragePanel = () => {
  const { storageMsg } = useWSInfo();
  const [activeTab, setActiveTab] = useState<SpyStorage.DataType>('local');
  const data = useMemo(() => {
    const msgCache = storageMsg[activeTab];
    return Object.entries(msgCache).map(([key, value]) => ({
      key,
      value,
    }));
  }, [activeTab, storageMsg]);
  return (
    <div className="storage-panel">
      <Layout className="storage-panel__layout">
        <Sider className="storage-panel__sider">
          <Menu
            className="storage-panel__menu"
            mode="inline"
            selectedKeys={[activeTab]}
            onSelect={({ key }) => setActiveTab(key as SpyStorage.DataType)}
          >
            <Menu.Item key="local">Local Storage</Menu.Item>
            <Menu.Item key="session">Session Storage</Menu.Item>
            <Menu.Item key="cookie">Cookie</Menu.Item>
          </Menu>
        </Sider>
        <Content className="storage-panel__content">
          <Table dataSource={data} pagination={false} tableLayout="fixed">
            <Column title="Key" dataIndex="key" key="key" width={300} />
            <Column
              title="Value"
              dataIndex="value"
              render={(value) => {
                return <TypeNode source={String(value)} />;
              }}
            />
          </Table>
        </Content>
      </Layout>
    </div>
  );
};
