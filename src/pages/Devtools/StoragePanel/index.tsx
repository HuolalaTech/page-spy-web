import type { SpyStorage } from '@huolala-tech/page-spy-types';
import { Button, Col, Layout, Menu, Row, Tooltip, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import './index.less';
import { useSocketMessageStore } from '@/store/socket-message';
import Icon, { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { StorageType, useStorageTypes } from '@/store/platform-config';
import { DBTable } from '@/components/DBTable';
import { StorageContent } from './StorageContent';
import { ResizableDetail } from '@/components/ResizableDetail';
import { useShallow } from 'zustand/react/shallow';
const { Sider, Content } = Layout;

export const StoragePanel = () => {
  const { t } = useTranslation();
  const refresh = useSocketMessageStore(useShallow((state) => state.refresh));

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
  
  // 创建按钮列表，用于移动端显示
  const storageButtons = useMemo(() => {
    return storageTypes.map((st) => (
      <Button
        key={st.name}
        type={activeTab === st.name ? 'primary' : 'default'}
        onClick={() => setActiveTab(st.name)}
        icon={<Icon component={st.icon} />}
        className="storage-type-button"
      >
        {st.label}
      </Button>
    ));
  }, [storageTypes, activeTab]);

  return (
    <div className="storage-panel">
      {/* PC端刷新按钮 */}
      <div className="storage-panel__refresh-container desktop-only">
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
      </div>
      
      {/* 移动端顶部按钮组 */}
      <div className="storage-panel__mobile-buttons mobile-only">
        <Space className="storage-buttons-container">
          {storageButtons}
          <Tooltip title={t('common.refresh')}>
            <Button
              onClick={() => {
                refresh(activeTab);
              }}
              icon={<ReloadOutlined />}
            />
          </Tooltip>
        </Space>
      </div>
      
      {/* PC端布局 */}
      <Layout className="storage-panel__layout desktop-layout">
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
      
      {/* 移动端布局 */}
      <div className="storage-panel__mobile-content mobile-only">
        {activeTab === 'indexedDB' ? (
          <DBTable />
        ) : (
          <StorageContent activeTab={activeTab} />
        )}
        {activeTab !== 'indexedDB' && <ResizableDetail />}
      </div>
    </div>
  );
};
