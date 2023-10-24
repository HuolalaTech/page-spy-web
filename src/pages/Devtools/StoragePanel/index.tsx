import type { SpyStorage } from '@huolala-tech/page-spy';
import { Button, Col, Layout, Menu, Row, Table, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ReactJsonView from '@huolala-tech/react-json-view';
import './index.less';
import { useSocketMessageStore } from '@/store/socket-message';
import { Resizable } from 'react-resizable';
import { HolderOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash-es';

const { Sider, Content } = Layout;
const { Column } = Table;

export const StoragePanel = () => {
  const { t } = useTranslation();
  const [storageMsg, refresh] = useSocketMessageStore((state) => [
    state.storageMsg,
    state.refresh,
  ]);
  useEffect(() => {
    refresh('localStorage');
    refresh('sessionStorage');
    refresh('cookie');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [activeTab, setActiveTab] =
    useState<SpyStorage.DataType>('localStorage');
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
      <Row justify="end">
        <Col>
          <Tooltip title={t('common.refresh')}>
            <Button
              onClick={() => {
                refresh(activeTab);
              }}
            >
              <ReloadOutlined />
            </Button>
          </Tooltip>
        </Col>
      </Row>
      <Layout className="storage-panel__layout">
        <Sider className="storage-panel__sider">
          <Menu
            className="storage-panel__menu"
            mode="inline"
            selectedKeys={[activeTab]}
            onSelect={({ key }) => setActiveTab(key as SpyStorage.DataType)}
            items={[
              { key: 'localStorage', label: 'Local Storage' },
              { key: 'sessionStorage', label: 'Session Storage' },
              { key: 'cookie', label: 'Cookie' },
            ]}
          />
        </Sider>
        <Layout>
          <Content className="storage-panel__content">
            <Table
              rowKey="name"
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
                  <ReactJsonView source={detailInfo} defaultExpand />
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
