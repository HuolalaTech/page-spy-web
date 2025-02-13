import { Col, Layout, Row } from 'antd';
import { MENU_COMPONENTS, MenuType, SiderMenu } from './components/SiderMenu';
import { useLocation } from 'react-router-dom';
import { memo, useMemo } from 'react';
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

  const Active = useMemo(() => {
    return MENU_COMPONENTS[hashKey] || MENU_COMPONENTS.Console;
  }, [hashKey]);

  return (
    <Layout className="plugin-panel">
      <Row
        justify="space-between"
        align="middle"
        wrap={false}
        style={{ paddingRight: 16, borderBottom: '1px solid rgb(5 5 5 / 6%)' }}
      >
        <Col flex={1}>
          <SiderMenu active={hashKey} />
        </Col>
        <Col>{Active.Extra && <Active.Extra />}</Col>
      </Row>
      <Content style={{ position: 'relative', flex: '1 1 0' }}>
        <Active.Content />
      </Content>
    </Layout>
  );
});
