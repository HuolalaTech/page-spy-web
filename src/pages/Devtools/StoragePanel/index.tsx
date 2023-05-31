import type { SpyStorage } from '@huolala-tech/page-spy';
import { Layout, Menu, Table, Tooltip } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { TypeNode } from '../TypeNode';
import './index.less';
import { useSocketMessageStore } from '@/store/socket-message';
import { Resizable } from 'react-resizable';
import { HolderOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash-es';

const { Sider, Content } = Layout;
const { Column } = Table;

export const StoragePanel = () => {
  const { t } = useTranslation();
  const storageMsg = useSocketMessageStore((state) => state.storageMsg);
  const [activeTab, setActiveTab] = useState<SpyStorage.DataType>('local');
  const data = useMemo(() => {
    return Object.values(storageMsg[activeTab]);
  }, [activeTab, storageMsg]);
  const hasDetail = useMemo(() => {
    const { id, name, value, ...rest } = data[0] || {};
    return Object.keys(rest).length > 0;
  }, [data]);

  const [detailSize, setDetailSize] = useState(100);
  const [detailInfo, setDetailInfo] = useState('');
  return (
    <div className="storage-panel">
      <Layout className="storage-panel__layout">
        <Sider className="storage-panel__sider">
          <Menu
            className="storage-panel__menu"
            mode="inline"
            selectedKeys={[activeTab]}
            onSelect={({ key }) => setActiveTab(key as SpyStorage.DataType)}
            items={[
              { key: 'local', label: 'Local Storage' },
              { key: 'session', label: 'Session Storage' },
              { key: 'cookie', label: 'Cookie' },
            ]}
          />
        </Sider>
        <Layout>
          <Content className="storage-panel__content">
            <Table
              bordered={false}
              dataSource={data}
              pagination={false}
              tableLayout="fixed"
              size="small"
              onRow={(record) => {
                return {
                  onClick() {
                    setDetailInfo(record.value || '');
                  },
                };
              }}
            >
              <Column title="Name" dataIndex="name" key="name" ellipsis />
              <Column title="Value" dataIndex="value" ellipsis />
              {hasDetail && (
                <>
                  <Column title="Domain" dataIndex="domain" ellipsis />
                  <Column title="Path" width={120} dataIndex="path" ellipsis />
                  <Column
                    title="Expires"
                    dataIndex="expires"
                    ellipsis
                    render={(value) => {
                      const time = value
                        ? new Date(value).toISOString()
                        : 'Session';
                      return (
                        <Tooltip placement="topLeft" title={time}>
                          {time}
                        </Tooltip>
                      );
                    }}
                  />
                  <Column
                    align="center"
                    title="Secure"
                    dataIndex="secure"
                    width={80}
                    render={(bool) => bool && '✅'}
                  />
                  <Column
                    title="SameSite"
                    dataIndex="sameSite"
                    width={80}
                    render={(v) => capitalize(v)}
                  />
                  <Column
                    title="Partitioned"
                    width={120}
                    dataIndex="partitioned"
                  />
                </>
              )}
            </Table>
          </Content>
          <Resizable
            axis="y"
            resizeHandles={['n']}
            height={detailSize}
            handle={
              <div className="height-controller">
                <HolderOutlined
                  style={{
                    transform: 'rotateZ(90deg)',
                    color: '#aaa',
                    fontSize: 16,
                  }}
                />
              </div>
            }
            onResize={(_, info) => {
              const { height } = info.size;
              if (height > 500 || height < 50) return;

              setDetailSize(height);
            }}
          >
            <div className="storage-panel__detail">
              <div
                className="storage-item-detail"
                style={{ height: detailSize, overflowY: 'auto' }}
              >
                {detailInfo ? (
                  <TypeNode source={detailInfo} />
                ) : (
                  <div className="empty-detail-info">
                    {t('storage.empty-detail')}
                  </div>
                )}
              </div>
            </div>
          </Resizable>
        </Layout>
      </Layout>
    </div>
  );
};
