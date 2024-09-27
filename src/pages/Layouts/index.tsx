import { Col, Layout, Row, Typography } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { ReactComponent as LogoSvg } from '@/assets/image/logo.svg';
import './index.less';
import clsx from 'clsx';
import { Suspense } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { NavMenuOnPc, NavMenuOnMobile } from './NavMenu';
import { useDarkTheme } from '@/utils/useDarkTheme';
import { version } from '../../../package.json';
import { isClient, isDoc } from '@/utils/constants';
import phSvg from '@/assets/image/producthunt.svg';

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
                  {isClient && (
                    <span className="page-spy-version">v{version}</span>
                  )}
                </Title>
              </Link>
              {isDoc && (
                <a
                  href="https://www.producthunt.com/posts/pagespy?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-pagespy"
                  target="_blank"
                >
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=429852&theme=light"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = phSvg;
                    }}
                    alt="PageSpy | Product Hunt"
                    height="36"
                  />
                </a>
              )}
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
