import { Col, Layout, Row, Typography } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ReactComponent as LogoSvg } from '@/assets/image/logo.svg';
import './index.less';
import clsx from 'clsx';
import { useMemo } from 'react';

const { Header, Content } = Layout;
const { Title } = Typography;

export const Layouts = () => {
  const { pathname } = useLocation();
  const useDarkBg = useMemo(() => {
    return pathname === '/';
  }, [pathname]);

  return (
    <Layout className="layouts">
      <Header className={clsx('header', useDarkBg && 'dark-bg')}>
        <Row justify="space-between">
          <Col>
            <div className="logo">
              <Link to="/">
                <LogoSvg className="logo-icon" />
                <Title level={4} className="logo-name">
                  PageSpy
                </Title>
              </Link>
            </div>
          </Col>
        </Row>
      </Header>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};
