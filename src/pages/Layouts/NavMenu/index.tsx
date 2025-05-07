import { isClient, isDoc } from '@/utils/constants';
import { langType, useLanguage } from '@/utils/useLanguage';
import { useAuth } from '@/utils/AuthContext';
import Icon from '@ant-design/icons';
import {
  Divider,
  MenuProps,
  Dropdown,
  ConfigProvider,
  Flex,
  Button,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DocsSvg from '@/assets/image/docs.svg?react';
import I18nSvg from '@/assets/image/i18n.svg?react';
import BugSvg from '@/assets/image/bug.svg?react';
import OnlineSvg from '@/assets/image/online.svg?react';
import ReplaySvg from '@/assets/image/replay.svg?react';
import RunSvg from '@/assets/image/run-right.svg?react';
import { LogoutOutlined } from '@ant-design/icons';
import i18n, { isCN } from '@/assets/locales';
import { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import './index.less';
import { CSSTransition } from 'react-transition-group';
import { createPortal } from 'react-dom';
import { useWhere } from '@/utils/useWhere';
import { CN_MIRROR_SITE } from '@/components/CNUserModal';
import { OpenDocSearch } from '@/components/DocSearch/OpenDocSearch';

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

const navDropdownConfig = {
  components: {
    Dropdown: {
      colorBgElevated: '#313131',
      colorText: '#eee',
    },
  },
};

export const NavMenuOnPc = () => {
  const [lang, setLang] = useLanguage();
  const { isOSpy } = useWhere();
  const { t } = useTranslation();
  const { isAuthenticated, logout, getAuthToken } = useAuth();
  const langMenus = useMemo(() => {
    return ALL_LANGS.filter((i) => i?.key !== lang);
  }, [lang]);

  // 判断是否应该显示登出按钮（无密码模式下不显示）
  const showLogoutButton = isAuthenticated && getAuthToken();

  return (
    <div className="nav-menu pc">
      {/* Docs */}
      <Link to="docs" className="menu-item doc">
        <Flex align="center" gap={8}>
          <Icon component={DocsSvg} style={{ fontSize: 18 }} />
          <span>{t('common.doc')}</span>
        </Flex>
      </Link>
      <Divider type="vertical" className="divider-bg" />
      {isClient && !isOSpy && (
        <>
          <div className="menu-item debug-type">
            <ConfigProvider theme={navDropdownConfig}>
              <Dropdown
                arrow
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'online-debug',
                      label: (
                        <Link to="/room-list" className="menu-item online">
                          <Flex align="center" gap={8}>
                            <Icon
                              component={OnlineSvg}
                              style={{ fontSize: 18 }}
                            />
                            <span>{t('common.online-debug')}</span>
                          </Flex>
                        </Link>
                      ),
                    },
                    {
                      key: 'offline-debug',
                      label: (
                        <Link to="/log-list" className="menu-item offline">
                          <Flex align="center" gap={8}>
                            <Icon
                              component={ReplaySvg}
                              style={{ fontSize: 18 }}
                            />
                            <span>{t('common.offline-debug')}</span>
                          </Flex>
                        </Link>
                      ),
                    },
                  ],
                }}
              >
                <Flex align="center" gap={8}>
                  <Icon component={BugSvg} style={{ fontSize: 18 }} />
                  <span>{t('common.start-debug')}</span>
                </Flex>
              </Dropdown>
            </ConfigProvider>
          </div>
          <Divider type="vertical" className="divider-bg" />
        </>
      )}
      {/* i18n */}
      <div className="menu-item lang">
        <ConfigProvider theme={navDropdownConfig}>
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
            <Flex align="center" gap={8}>
              <Icon component={I18nSvg} style={{ fontSize: 18 }} />
              <span>{t('common.lang')}</span>
            </Flex>
          </Dropdown>
        </ConfigProvider>
      </div>
      <Divider type="vertical" className="divider-bg" />
      {/* 登出按钮 */}
      {showLogoutButton && (
        <>
          <Button
            type="text"
            className="menu-item logout"
            onClick={logout}
            icon={<LogoutOutlined />}
          >
            {t('auth.logout')}
          </Button>
          <Divider type="vertical" className="divider-bg" />
        </>
      )}
      {/* Mirror */}
      {isDoc && isCN() && (
        <>
          <a href={CN_MIRROR_SITE} target="_blank" className="menu-item doc">
            <Flex align="center" gap={8}>
              <Icon component={RunSvg} style={{ fontSize: 16 }} />
              <span>国内镜像</span>
            </Flex>
          </a>
          <Divider type="vertical" className="divider-bg" />
        </>
      )}
      <a
        href={import.meta.env.VITE_GITHUB_REPO}
        target="_blank"
        className="menu-item"
        style={{ fontSize: 0 }}
      >
        <img
          src="https://img.shields.io/github/stars/HuolalaTech/page-spy-web?style=social"
          alt=""
        />
      </a>
    </div>
  );
};

export const NavMenuOnMobile = () => {
  const { isOSpy } = useWhere();
  const [lang, setLang] = useLanguage();
  const { t } = useTranslation();
  const { isAuthenticated, logout, getAuthToken } = useAuth();
  const [expand, setExpand] = useState(false);
  const fixedMenuRef = useRef<HTMLDivElement | null>(null);

  // 判断是否应该显示登出按钮（无密码模式下不显示）
  const showLogoutButton = isAuthenticated && getAuthToken();

  return (
    <>
      <div className="nav-menu mobile">
        <OpenDocSearch />
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
          <div ref={fixedMenuRef} className="fixed-menu">
            {/* Docs */}
            <Link
              to="docs"
              className="menu-item doc"
              onClick={() => {
                setExpand(false);
              }}
            >
              <Flex align="center" gap={8}>
                <Icon component={DocsSvg} style={{ fontSize: 18 }} />
                <span>{t('common.doc')}</span>
              </Flex>
            </Link>
            {isClient && !isOSpy && (
              <>
                {/* Connections */}
                <Link
                  to="room-list"
                  className="menu-item online"
                  onClick={() => {
                    setExpand(false);
                  }}
                >
                  <Flex align="center" gap={8}>
                    <Icon component={OnlineSvg} style={{ fontSize: 18 }} />
                    <span>{t('common.connections')}</span>
                  </Flex>
                </Link>
              </>
            )}
            {/* 登出按钮 */}
            {showLogoutButton && (
              <div
                className="menu-item logout"
                onClick={() => {
                  logout();
                  setExpand(false);
                }}
              >
                <Flex align="center" gap={8}>
                  <LogoutOutlined style={{ fontSize: 18 }} />
                  <span>{t('auth.logout')}</span>
                </Flex>
              </div>
            )}
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
              <Flex align="center" gap={8}>
                <Icon component={I18nSvg} style={{ fontSize: 18 }} />
                <span>{t('common.lang')}</span>
              </Flex>
            </div>
            {/* Mirror */}
            {isDoc && isCN() && (
              <a
                href={CN_MIRROR_SITE}
                target="_blank"
                className="menu-item doc"
                onClick={() => {
                  setExpand(false);
                }}
              >
                <Flex align="center" gap={8}>
                  <Icon component={RunSvg} style={{ fontSize: 16 }} />
                  <span>国内镜像</span>
                </Flex>
              </a>
            )}
            {/* GitHub */}
            <div className="menu-item">
              <a href={import.meta.env.VITE_GITHUB_REPO} target="_blank">
                <img
                  src="https://img.shields.io/github/stars/HuolalaTech/page-spy-web?style=social"
                  alt=""
                />
              </a>
            </div>
          </div>
        </CSSTransition>,
        document.querySelector('header') || document.body,
      )}
    </>
  );
};
