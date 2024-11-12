import Icon from '@ant-design/icons';
import { SpyStorage } from '@huolala-tech/page-spy-types';
import { Layout, Menu } from 'antd';
import { memo, useMemo, useState } from 'react';
import { ReactComponent as StorageSvg } from '@/assets/image/storage.svg';
import { ReactComponent as CookieSvg } from '@/assets/image/cookie.svg';
import { StorageContent } from './StorageContent';
import './index.less';
import { ResizableDetail } from '@/components/ResizableDetail';
import { useReplayStore } from '@/store/replay';
import { useShallow } from 'zustand/react/shallow';
import {
  isMiniProgram,
  isReactNative,
  isUniAppNative,
} from '@/store/platform-config';

const { Sider, Content } = Layout;

export const StoragePanel = memo(() => {
  const [activeTab, setActiveTab] =
    useState<SpyStorage.DataType>('localStorage');

  const clientInfo = useReplayStore(useShallow((state) => state.clientInfo));

  const storageMenus = useMemo(() => {
    const menus = [
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
    const browserType = clientInfo?.browser.type || 'unknown';
    if (isMiniProgram(browserType) || isUniAppNative(browserType)) {
      menus.splice(0);
      menus.push({
        key: 'mpStorage',
        label: '小程序 Storage',
        icon: <Icon component={StorageSvg} />,
      });
    } else if (isReactNative(browserType)) {
      menus.splice(0);
      menus.push({
        key: 'asyncStorage',
        label: 'Async Storage',
        icon: <Icon component={StorageSvg} />,
      });
    }

    setActiveTab(menus[0].key as SpyStorage.DataType);
    return menus;
  }, [clientInfo?.browser.type]);

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
