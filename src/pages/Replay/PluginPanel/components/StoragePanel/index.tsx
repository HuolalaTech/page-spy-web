import Icon from '@ant-design/icons';
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { Layout, Menu } from 'antd';
import { memo, useState } from 'react';
import { ReactComponent as StorageSvg } from '@/assets/image/storage.svg';
import { ReactComponent as CookieSvg } from '@/assets/image/cookie.svg';
import { StorageContent } from './StorageContent';
import './index.less';
import { ResizableDetail } from '@/components/ResizableDetail';

const { Sider, Content } = Layout;

const storageMenus = [
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
    label: 'Cookies',
    icon: <Icon component={CookieSvg} />,
  },
];

export const StoragePanel = memo(() => {
  const [activeTab, setActiveTab] =
    useState<SpyStorage.DataType>('localStorage');

  return (
    <div className="storage-panel">
      <Layout className="storage-panel__layout">
        <Sider className="storage-panel__sider">
          <Menu
            className="storage-panel__menu"
            mode="inline"
            selectedKeys={[activeTab]}
            onSelect={({ key }) => setActiveTab(key as SpyStorage.DataType)}
            items={storageMenus}
          />
        </Sider>
        <Layout>
          <Content className="storage-panel__content">
            <StorageContent activeTab={activeTab} />
          </Content>
          <ResizableDetail />
        </Layout>
      </Layout>
    </div>
  );
});
