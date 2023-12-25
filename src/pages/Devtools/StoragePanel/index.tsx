import type { SpyStorage } from '@huolala-tech/page-spy';
import { Button, Col, Layout, Menu, Row, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ReactJsonView from '@huolala-tech/react-json-view';
import './index.less';
import { useSocketMessageStore } from '@/store/socket-message';
import { Resizable } from 'react-resizable';
import Icon, { HolderOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCacheDetailStore } from '@/store/cache-detail';
import { DatabaseInfo, StorageInfo } from './TableContent';
import { useStorageTypes } from '@/store/platform-config';

const { Sider, Content } = Layout;

export const StoragePanel = () => {
  const { t } = useTranslation();
  const refresh = useSocketMessageStore((state) => state.refresh);

  const detailInfo = useCacheDetailStore((state) => state.currentDetail);
  const [detailSize, setDetailSize] = useState(100);

  const storageTypes = useStorageTypes();

  const [activeTab, setActiveTab] = useState<SpyStorage.DataType | 'indexedDB'>(
    () => {
      if (storageTypes.length > 0) {
        return storageTypes[0].name;
      }
      return 'localStorage';
    },
  );

  useEffect(() => {
    if (
      storageTypes.length > 0 &&
      !storageTypes.some((t) => t.name === activeTab)
    ) {
      setActiveTab(storageTypes[0].name);
    }
  }, [storageTypes, activeTab]);

  const storageList = useMemo(() => {
    return storageTypes.map((st) => {
      return {
        key: st.name,
        label: st.label,
        icon: <Icon component={st.icon} />,
      };
    });
  }, [storageTypes]);

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
            items={storageList}
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
