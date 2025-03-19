import { Col, Flex, Layout, Row } from 'antd';
import { Outlet } from 'react-router-dom';
import './index.less';
import { Suspense, useEffect } from 'react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { NavMenuOnPc, NavMenuOnMobile } from './NavMenu';
import { isDoc } from '@/utils/constants';
import { Logo } from './Logo';
import { useWhere } from '@/utils/useWhere';
import { useTitle } from 'ahooks';
import { useDarkTheme } from '@/utils/useDarkTheme';

const { Header, Content } = Layout;

export const Layouts = () => {
  const isDark = useDarkTheme();
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const { isOSpy } = useWhere();
  useTitle(isOSpy ? 'O-Spy' : 'PageSpy');

  return (
    <Layout className="layouts">
      <Header>
        <Row justify="space-between" align="middle" className="header">
          <Col>
            <Flex gap={20} align="center">
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
                    style={{ height: 36 }}
                  />
                </a>
              )}
            </Flex>
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
