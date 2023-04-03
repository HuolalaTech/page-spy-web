import { Col, Divider, Layout, Row, Space, Typography } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ReactComponent as LogoSvg } from '@/assets/image/logo.svg';
import { ReactComponent as DocsSvg } from '@/assets/image/docs.svg';
import { ReactComponent as I18nSvg } from '@/assets/image/i18n.svg';
import { ReactComponent as InjectSdkSvg } from '@/assets/image/inject-sdk.svg';
import { ReactComponent as OnlineSvg } from '@/assets/image/online.svg';
import './index.less';
import clsx from 'clsx';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/utils/useLanguage';
import i18n from '@/assets/locales';
import { LoadingFallback } from '@/components/LoadingFallback';
import Icon from '@ant-design/icons';
import { isClient } from '@/utils/constants';
import { InjectSDKModal } from '@/components/InjectSDK';

const { Header, Content } = Layout;
const { Title } = Typography;

export const Layouts = () => {
  const [lang, setLang] = useLanguage();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDark = useMemo(() => {
    return ['/', '/docs'].includes(pathname);
  }, [pathname]);

  return (
    <Layout className="layouts">
      <Header className={clsx('header', isDark && 'is-dark')}>
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
            <Space className="menu">
              {isClient && (
                <>
                  {/* Inject */}
                  <InjectSDKModal>
                    {({ onPopup }) => {
                      return (
                        <p className="menu-item inject" onClick={onPopup}>
                          <Space align="center">
                            <Icon
                              component={InjectSdkSvg}
                              style={{ fontSize: 18 }}
                            />
                            <span>{t('common.inject-sdk')}</span>
                          </Space>
                        </p>
                      );
                    }}
                  </InjectSDKModal>
                  <Divider type="vertical" className="divider-bg" />
                  <Link to="/room-list">
                    <p className="menu-item online">
                      <Space align="center">
                        <Icon component={OnlineSvg} style={{ fontSize: 18 }} />
                        <span>{t('common.connections')}</span>
                      </Space>
                    </p>
                  </Link>
                  <Divider type="vertical" className="divider-bg" />
                </>
              )}
              <Link to="/docs">
                <p className="menu-item doc">
                  <Space align="center">
                    <Icon component={DocsSvg} style={{ fontSize: 18 }} />
                    <span>{t('common.doc')}</span>
                  </Space>
                </p>
              </Link>
              <Divider type="vertical" className="divider-bg" />
              <p
                className="menu-item lang"
                onClick={() => {
                  const newLang = lang === 'en' ? 'zh' : 'en';
                  setLang(newLang);
                  i18n.changeLanguage(newLang);
                }}
              >
                <Space align="center">
                  <Icon component={I18nSvg} style={{ fontSize: 18 }} />
                  <span>{t('common.lang')}</span>
                </Space>
              </p>
            </Space>
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
