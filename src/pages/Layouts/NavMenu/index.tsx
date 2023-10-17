import { InjectSDKModal } from '@/components/InjectSDK';
import { isClient } from '@/utils/constants';
import { langType, useLanguage } from '@/utils/useLanguage';
import Icon, { GithubOutlined } from '@ant-design/icons';
import { Space, Divider, MenuProps, Dropdown, ConfigProvider } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ReactComponent as DocsSvg } from '@/assets/image/docs.svg';
import { ReactComponent as I18nSvg } from '@/assets/image/i18n.svg';
import { ReactComponent as InjectSdkSvg } from '@/assets/image/inject-sdk.svg';
import { ReactComponent as OnlineSvg } from '@/assets/image/online.svg';
import i18n from '@/assets/locales';
import { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import './index.less';
import { useDarkTheme } from '@/utils/useDarkTheme';
import { CSSTransition } from 'react-transition-group';
import { createPortal } from 'react-dom';

const ALL_LANGS: MenuProps['items'] = [
  {
    key: 'zh',
    label: <span>简体中文</span>,
  },
  {
    key: 'en',
    label: <span>English</span>,
  },
  {
    key: 'ja',
    label: <span>日本語</span>,
  },
  {
    key: 'ko',
    label: <span>한국어</span>,
  },
];

export const NavMenuOnPc = () => {
  const isDark = useDarkTheme();
  const [lang, setLang] = useLanguage();
  const { t } = useTranslation();
  const langMenus = useMemo(() => {
    return ALL_LANGS.filter((i) => i?.key !== lang);
  }, [lang]);

  return (
    <div
      className={clsx('nav-menu pc', {
        'is-dark': isDark,
      })}
    >
      {isClient && (
        <>
          {/* Inject */}
          <InjectSDKModal>
            {({ onPopup }) => {
              return (
                <div className="menu-item inject" onClick={onPopup}>
                  <Space align="center">
                    <Icon component={InjectSdkSvg} style={{ fontSize: 18 }} />
                    <span>{t('common.inject-sdk')}</span>
                  </Space>
                </div>
              );
            }}
          </InjectSDKModal>
          <Divider type="vertical" className="divider-bg" />
          {/* Connections */}
          <Link to="/room-list" className="menu-item online">
            <Space align="center">
              <Icon component={OnlineSvg} style={{ fontSize: 18 }} />
              <span>{t('common.connections')}</span>
            </Space>
          </Link>
          <Divider type="vertical" className="divider-bg" />
        </>
      )}
      {/* Docs */}
      <Link to="/docs" className="menu-item doc">
        <Space align="center">
          <Icon component={DocsSvg} style={{ fontSize: 18 }} />
          <span>{t('common.doc')}</span>
        </Space>
      </Link>
      <Divider type="vertical" className="divider-bg" />
      {/* i18n */}
      <div className="menu-item lang">
        <ConfigProvider
          theme={{
            components: {
              Dropdown: {
                colorBgElevated: '#333',
                colorText: '#eee',
              },
            },
          }}
        >
          <Dropdown
            arrow
            menu={{
              items: langMenus,
              onClick: ({ key }) => {
                setLang(key as langType);
                i18n.changeLanguage(key);
              },
            }}
          >
            <Space align="center">
              <Icon component={I18nSvg} style={{ fontSize: 18 }} />
              <span>{t('common.lang')}</span>
            </Space>
          </Dropdown>
        </ConfigProvider>
      </div>
      <Divider type="vertical" className="divider-bg" />
      <a
        href={import.meta.env.VITE_GITHUB_REPO}
        target="_blank"
        className="menu-item"
      >
        <Space>
          <GithubOutlined style={{ fontSize: 16 }} />
          <span>Github</span>
        </Space>
      </a>
    </div>
  );
};

export const NavMenuOnMobile = () => {
  const [lang, setLang] = useLanguage();
  const { t } = useTranslation();
  const isDark = useDarkTheme();
  const [expand, setExpand] = useState(false);
  const fixedMenuRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <div
        className={clsx('nav-menu mobile', {
          'is-dark': isDark,
        })}
      >
        <button
          className={clsx('menu-hamburger', {
            'is-expanded': expand,
          })}
          onClick={() => {
            setExpand(!expand);
          }}
        >
          <div className="hamburger-box">
            <div className="hamburger-item top" />
            <div className="hamburger-item middle" />
            <div className="hamburger-item bottom" />
          </div>
        </button>
      </div>
      {createPortal(
        <CSSTransition
          nodeRef={fixedMenuRef}
          in={expand}
          timeout={200}
          classNames="fixed-menu-fade"
          mountOnEnter
          unmountOnExit
        >
          <div
            ref={fixedMenuRef}
            className={clsx('fixed-menu', {
              'is-dark': isDark,
            })}
          >
            {isClient && (
              <>
                {/* Inject */}
                <InjectSDKModal>
                  {({ onPopup }) => {
                    return (
                      <div className="menu-item inject" onClick={onPopup}>
                        <Space align="center">
                          <Icon
                            component={InjectSdkSvg}
                            style={{ fontSize: 18 }}
                          />
                          <span>{t('common.inject-sdk')}</span>
                        </Space>
                      </div>
                    );
                  }}
                </InjectSDKModal>
                {/* Connections */}
                <Link
                  to="/room-list"
                  className="menu-item online"
                  onClick={() => {
                    setExpand(false);
                  }}
                >
                  <Space align="center">
                    <Icon component={OnlineSvg} style={{ fontSize: 18 }} />
                    <span>{t('common.connections')}</span>
                  </Space>
                </Link>
              </>
            )}
            {/* Docs */}
            <Link
              to="/docs"
              className="menu-item doc"
              onClick={() => {
                setExpand(false);
              }}
            >
              <Space align="center">
                <Icon component={DocsSvg} style={{ fontSize: 18 }} />
                <span>{t('common.doc')}</span>
              </Space>
            </Link>
            {/* i18n */}
            <div
              className="menu-item lang"
              onClick={() => {
                const newLang = lang === 'en' ? 'zh' : 'en';
                setLang(newLang);
                i18n.changeLanguage(newLang);
                setExpand(false);
              }}
            >
              <Space align="center">
                <Icon component={I18nSvg} style={{ fontSize: 18 }} />
                <span>{t('common.lang')}</span>
              </Space>
            </div>
            {/* Github */}
            <div className="menu-item">
              <a href={import.meta.env.VITE_GITHUB_REPO} target="_blank">
                <Space>
                  <GithubOutlined style={{ fontSize: 16 }} />
                  <span>Github</span>
                </Space>
              </a>
            </div>
          </div>
        </CSSTransition>,
        document.querySelector('header') || document.body,
      )}
    </>
  );
};
