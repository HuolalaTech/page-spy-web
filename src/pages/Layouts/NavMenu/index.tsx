import { InjectSDKModal } from '@/components/InjectSDK';
import { isClient } from '@/utils/constants';
import { useLanguage } from '@/utils/useLanguage';
import Icon from '@ant-design/icons';
import { Space, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ReactComponent as DocsSvg } from '@/assets/image/docs.svg';
import { ReactComponent as I18nSvg } from '@/assets/image/i18n.svg';
import { ReactComponent as InjectSdkSvg } from '@/assets/image/inject-sdk.svg';
import { ReactComponent as OnlineSvg } from '@/assets/image/online.svg';
import i18n from '@/assets/locales';
import { useRef, useState } from 'react';
import clsx from 'clsx';
import './index.less';
import { useDarkTheme } from '@/utils/useDarkTheme';
import { CSSTransition } from 'react-transition-group';
import { createPortal } from 'react-dom';

export const NavMenuOnPc = () => {
  const isDark = useDarkTheme();
  const [lang, setLang] = useLanguage();
  const { t } = useTranslation();
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
                <p className="menu-item inject" onClick={onPopup}>
                  <Space align="center">
                    <Icon component={InjectSdkSvg} style={{ fontSize: 18 }} />
                    <span>{t('common.inject-sdk')}</span>
                  </Space>
                </p>
              );
            }}
          </InjectSDKModal>
          <Divider type="vertical" className="divider-bg" />
          {/* Connections */}
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
      {/* Docs */}
      <Link to="/docs">
        <p className="menu-item doc">
          <Space align="center">
            <Icon component={DocsSvg} style={{ fontSize: 18 }} />
            <span>{t('common.doc')}</span>
          </Space>
        </p>
      </Link>
      <Divider type="vertical" className="divider-bg" />
      {/* i18n */}
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
                {/* Connections */}
                <Link
                  to="/room-list"
                  onClick={() => {
                    setExpand(false);
                  }}
                >
                  <p className="menu-item online">
                    <Space align="center">
                      <Icon component={OnlineSvg} style={{ fontSize: 18 }} />
                      <span>{t('common.connections')}</span>
                    </Space>
                  </p>
                </Link>
              </>
            )}
            {/* Docs */}
            <Link
              to="/docs"
              onClick={() => {
                setExpand(false);
              }}
            >
              <p className="menu-item doc">
                <Space align="center">
                  <Icon component={DocsSvg} style={{ fontSize: 18 }} />
                  <span>{t('common.doc')}</span>
                </Space>
              </p>
            </Link>
            {/* i18n */}
            <p
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
            </p>
          </div>
        </CSSTransition>,
        document.querySelector('header') || document.body,
      )}
    </>
  );
};
