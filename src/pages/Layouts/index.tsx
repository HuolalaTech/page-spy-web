import { Col, Layout, Row } from 'antd';
import { Outlet } from 'react-router-dom';
import './index.less';
import clsx from 'clsx';
import { Suspense } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { NavMenuOnPc, NavMenuOnMobile } from './NavMenu';
import { useDarkTheme } from '@/utils/useDarkTheme';
import { isDoc } from '@/utils/constants';
import { Logo } from './Logo';

const { Header, Content } = Layout;

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
              <Logo />
              {isDoc && (
                <a
                  href="https://trendshift.io/repositories/5407"
                  target="_blank"
                  className="third-brand"
                >
                  <img
                    src="https://trendshift.io/api/badge/repositories/5407"
                    alt="HuolalaTech/page-spy-web | Trendshift"
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
