import { Col, Layout, Row, Typography } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { ReactComponent as LogoSvg } from '@/assets/image/logo.svg';
import './index.less';
import clsx from 'clsx';
import { Suspense } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { NavMenuOnPc, NavMenuOnMobile } from './NavMenu';
import { useDarkTheme } from '@/utils/useDarkTheme';

const { Header, Content } = Layout;
const { Title } = Typography;

export const Layouts = () => {
  const isDark = useDarkTheme();

  return (
    <Layout className="layouts">
      <Header>
        <Row
          justify="space-between"
          align="middle"
          className={clsx('header', isDark && 'is-dark')}
        >
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
          <Col>
            <NavMenuOnPc />
            <NavMenuOnMobile />
          </Col>
        </Row>
      </Header>
      <Content>
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </Content>
    </Layout>
  );
};
