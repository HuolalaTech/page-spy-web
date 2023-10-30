import type { SpyStorage } from '@huolala-tech/page-spy';
import { Button, Col, Layout, Menu, Row, Tooltip } from 'antd';
import { useState } from 'react';
import ReactJsonView from '@huolala-tech/react-json-view';
import './index.less';
import { useSocketMessageStore } from '@/store/socket-message';
import { Resizable } from 'react-resizable';
import Icon, { HolderOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ReactComponent as StorageSvg } from '@/assets/image/storage.svg';
import { ReactComponent as CookieSvg } from '@/assets/image/cookie.svg';
import { ReactComponent as DatabaseSvg } from '@/assets/image/database.svg';
import { useCacheDetailStore } from '@/store/cache-detail';
import { DatabaseInfo, StorageInfo } from './TableContent';

const { Sider, Content } = Layout;

export const StoragePanel = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SpyStorage.DataType | 'indexedDB'>(
    'localStorage',
  );
  const refresh = useSocketMessageStore((state) => state.refresh);

  const detailInfo = useCacheDetailStore((state) => state.currentDetail);
  const [detailSize, setDetailSize] = useState(100);

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
              {
                key: 'localStorage',
                label: 'Local Storage',
                icon: <Icon component={StorageSvg} />,
              },
              {
                key: 'sessionStorage',
                label: 'Session Storage',
                icon: <Icon component={StorageSvg} />,
              },
              {
                key: 'cookie',
                label: 'Cookie',
                icon: <Icon component={CookieSvg} />,
              },
              {
                key: 'indexedDB',
                label: 'IndexedDB',
                icon: <Icon component={DatabaseSvg} />,
              },
            ]}
          />
        </Sider>
        <Layout>
          <Content className="storage-panel__content">
            {activeTab === 'indexedDB' ? (
              <DatabaseInfo />
            ) : (
              <StorageInfo activeTab={activeTab} />
            )}
          </Content>
          {activeTab !== 'indexedDB' && (
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
          )}
        </Layout>
      </Layout>
    </div>
  );
};
