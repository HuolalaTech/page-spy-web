import { Layout } from 'antd';
import { MENU_COMPONENTS, MenuType, SiderMenu } from './components/SiderMenu';
import { useLocation } from 'react-router-dom';
import { memo, useMemo } from 'react';
import { ConsolePanel } from './components/ConsolePanel';
import './index.less';

const { Content } = Layout;

export const PluginPanel = memo(() => {
  const { hash = '#Console' } = useLocation();
  const hashKey = useMemo<MenuType>(() => {
    const value = hash.slice(1);
    if (!(value in MENU_COMPONENTS)) {
      return 'Console';
    }
    return value as MenuType;
  }, [hash]);

  const ActiveContent = useMemo(() => {
    const content = MENU_COMPONENTS[hashKey];
    return content.component || ConsolePanel;
  }, [hashKey]);

  return (
    <Layout className="plugin-panel">
      <SiderMenu active={hashKey} />
      <Content style={{ position: 'relative', flex: '1 1 0' }}>
        <ActiveContent />
      </Content>
    </Layout>
  );
});
