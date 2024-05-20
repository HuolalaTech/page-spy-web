import type { SpyStorage } from '@huolala-tech/page-spy-types';
import { Button, Col, Layout, Menu, Row, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import './index.less';
import { useSocketMessageStore } from '@/store/socket-message';
import Icon, { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { StorageType, useStorageTypes } from '@/store/platform-config';
import { DBTable } from '@/components/DBTable';
import { StorageContent } from './StorageContent';
import { ResizableDetail } from '@/components/ResizableDetail';

const { Sider, Content } = Layout;

export const StoragePanel = () => {
  const { t } = useTranslation();
  const refresh = useSocketMessageStore((state) => state.refresh);

  const storageTypes = useStorageTypes();

  const [activeTab, setActiveTab] = useState<StorageType | 'indexedDB'>(() => {
    if (storageTypes.length > 0) {
      return storageTypes[0].name;
    }
    return 'localStorage';
  });

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
              <DBTable />
            ) : (
              <StorageContent activeTab={activeTab} />
            )}
          </Content>
          {activeTab !== 'indexedDB' && <ResizableDetail />}
        </Layout>
      </Layout>
    </div>
  );
};
