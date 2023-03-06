import { Col, Layout, Row, Typography } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ReactComponent as LogoSvg } from '@/assets/image/logo.svg';
import './index.less';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { langType, useLanguage } from '@/utils/useLanguage';
import i18n from '@/assets/locales';

const { Header, Content } = Layout;
const { Title } = Typography;

const languages: Record<langType, { title: string }> = {
  zh: {
    title: '中文',
  },
  en: {
    title: 'English',
  },
};

export const Layouts = () => {
  const [lang, setLang] = useLanguage();

  const { pathname } = useLocation();
  const isHome = useMemo(() => {
    return pathname === '/';
  }, [pathname]);

  return (
    <Layout className="layouts">
      <Header className={clsx('header', isHome && 'is-home')}>
        <Row justify="space-between" align="middle">
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
            <p
              className="lang"
              onClick={() => {
                const newLang = lang === 'en' ? 'zh' : 'en';
                setLang(newLang);
                i18n.changeLanguage(newLang);
              }}
            >
              {languages[lang].title}
            </p>
          </Col>
        </Row>
      </Header>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};
