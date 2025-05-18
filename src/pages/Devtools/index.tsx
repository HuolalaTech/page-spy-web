import {
  Col,
  Divider,
  Layout,
  Menu,
  message,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import React, { memo, useEffect, useMemo, useState } from 'react';
import ConsolePanel from './ConsolePanel';
import NetworkPanel from './NetworkPanel';
import SystemPanel from './SystemPanel';
import { useNavigate, useLocation } from 'react-router-dom';
import PagePanel from './PagePanel';
import clsx from 'clsx';
import './index.less';
import { StoragePanel } from './StoragePanel';
import useSearch from '@/utils/useSearch';
import { useEventListener } from '@/utils/useEventListener';
import { useTranslation } from 'react-i18next';
import { ConnectStatus } from './ConnectStatus';
import { useSocketMessageStore } from '@/store/socket-message';
import '@huolala-tech/react-json-view/dist/style.css';
import { throttle } from 'lodash-es';
import { CUSTOM_EVENT } from '@/store/socket-message/socket';
import { SpyClient } from '@huolala-tech/page-spy-types';
import MPWarning from '@/components/MPWarning';
import {
  isBrowser,
  isHarmonyApp,
  isMiniProgram,
} from '@/store/platform-config';
import { useShallow } from 'zustand/react/shallow';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
const { Sider, Content } = Layout;
const { Title } = Typography;

type MenuType = 'Console' | 'Network' | 'Page' | 'Storage' | 'System';

const MENU_COMPONENTS: Record<
  MenuType,
  {
    component: React.FC;
    visible?: (params: {
      browser: SpyClient.Browser;
      os: SpyClient.OS;
    }) => boolean;
  }
> = {
  Console: {
    component: ConsolePanel,
  },
  Network: {
    component: NetworkPanel,
  },
  Page: {
    component: PagePanel,
    visible: ({ browser }) => {
      return isBrowser(browser);
    },
  },
  Storage: {
    component: StoragePanel,
  },
  System: {
    component: SystemPanel,
    visible: ({ browser }) => {
      return (
        isBrowser(browser) || isHarmonyApp(browser) || isMiniProgram(browser)
      );
    },
  },
};

interface BadgeMenuProps {
  active: MenuType;
  setCollapsed?: (collapsed: boolean) => void;
  isMobile?: boolean;
}
const BadgeMenu = memo(({ active, setCollapsed, isMobile }: BadgeMenuProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'devtool' });
  const navigate = useNavigate();
  const { search } = useLocation();
  const [badge, setBadge] = useState<Record<MenuType, boolean>>({
    Console: false,
    Network: false,
    Page: false,
    Storage: false,
    System: false,
  });
  useEventListener(
    CUSTOM_EVENT.NewMessageComing,
    throttle((evt) => {
      const { detail } = evt as CustomEvent;
      const type = `${(detail as string)[0].toUpperCase()}${detail.slice(
        1,
      )}` as MenuType;
      if (type !== active) {
        setBadge((prev) => ({
          ...prev,
          [type]: true,
        }));
      }
    }, 100),
  );

  useEffect(() => {
    setBadge((prev) => ({
      ...prev,
      [active]: false,
    }));
  }, [active]);

  const clientInfo = useSocketMessageStore(
    useShallow((state) => state.clientInfo),
  );

  const menuItems = useMemo(() => {
    if (!clientInfo) return;
    return Object.entries(MENU_COMPONENTS)
      .filter(([key, item]) => {
        // Menu filter by some conditions``
        return (
          !item.visible ||
          item.visible({
            browser: clientInfo.browser.type,
            os: clientInfo.os.type,
          })
        );
      })
      .map(([key, item]) => {
        return {
          key,
          label: (
            <div
              className="sider-menu__item"
              onClick={() => {
                navigate({ search, hash: key });
                // 在移动端点击菜单项后自动收起侧边栏
                if (isMobile && setCollapsed) {
                  setCollapsed(true);
                }
              }}
            >
              <span>{t(`menu.${key}`)}</span>
              <div
                className={clsx('circle-badge', {
                  show: badge[key as MenuType],
                })}
              />
            </div>
          ),
        };
      });
  }, [clientInfo, badge, navigate, search, t, isMobile, setCollapsed]);

  if (!clientInfo) {
    return Object.keys(MENU_COMPONENTS).map((_, index) => {
      return (
        <Skeleton.Button
          key={index}
          active
          style={{ display: 'block', width: '90%', margin: '12px auto 0' }}
        />
      );
    });
  }

  return (
    <Menu
      className="sider-menu"
      mode="inline"
      selectedKeys={[active]}
      items={menuItems}
    />
  );
});

const ClientInfo = memo(() => {
  const { t } = useTranslation('translation', { keyPrefix: 'devtool' });
  const { address = '' } = useSearch();
  const clientInfo = useSocketMessageStore(
    useShallow((state) => state.clientInfo),
  );

  return (
    <div className="client-info">
      <Title level={4} style={{ marginBlock: 12 }}>
        {t('device')}
      </Title>
      <Row wrap={false} align="middle" style={{ textAlign: 'center' }}>
        <Tooltip
          title={
            <>
              <span>
                {t('system')}: {clientInfo?.os.name}
              </span>
              <br />
              <span>
                {t('version')}: {clientInfo?.os.version}
              </span>
            </>
          }
        >
          <Col span={11}>
            <img className="client-info__logo" src={clientInfo?.os.logo} />
          </Col>
        </Tooltip>
        <Divider type="vertical" />
        <Tooltip
          title={
            <>
              <span>
                {t('platform')}: {clientInfo?.browser.name}
              </span>
              <br />
              <span>
                {t('version')}: {clientInfo?.browser.version}
              </span>
            </>
          }
        >
          <Col span={11}>
            <img className="client-info__logo" src={clientInfo?.browser.logo} />
          </Col>
        </Tooltip>
      </Row>
      <Divider type="horizontal" style={{ margin: '8px 0' }} />
      <Tooltip title="Device ID">
        <Row justify="center" className="page-spy-id">
          <Col>
            <b>{address.slice(0, 4)}</b>
          </Col>
        </Row>
      </Tooltip>
    </div>
  );
});

export default function Devtools() {
  const { hash = '#Console' } = useLocation();
  const { address = '', secret = '' } = useSearch();
  const [socket, initSocket, clientInfo] = useSocketMessageStore(
    useShallow((state) => [state.socket, state.initSocket, state.clientInfo]),
  );
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (socket) return;
    initSocket({ address, secret });
  }, [address, initSocket, secret, socket]);

  const hashKey = useMemo<MenuType>(() => {
    const value = hash.slice(1);
    if (!(value in MENU_COMPONENTS)) {
      return 'Console';
    }
    return value as MenuType;
  }, [hash]);

  const ActiveContent = useMemo(() => {
    const content = MENU_COMPONENTS[hashKey];
    return content.component || ConsolePanel;
  }, [hashKey]);

  if (!address) {
    message.error('Error url params!');
    return null;
  }

  // eslint-disable-next-line consistent-return
  return (
    <Layout className="page-spy-devtools">
      <Sider
        theme="light"
        collapsed={collapsed}
        collapsedWidth={0}
        trigger={null}
        collapsible
      >
        <div className="page-spy-devtools__sider">
          <ClientInfo />
          {clientInfo?.plugins?.includes('MPEvalPlugin') && (
            <MPWarning className="sider-warning" />
          )}
          <BadgeMenu active={hashKey} setCollapsed={setCollapsed} isMobile={isMobile} />
        </div>
      </Sider>
      <div
        className="sider-trigger"
        onClick={() => setCollapsed(!collapsed)}
        style={{
          backgroundColor: collapsed ? 'transparent' : '#fff',
          left: collapsed ? 0 : 200,
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <Content
        className="page-spy-devtools__content"
        style={{ marginLeft: isMobile ? 0 : collapsed ? 0 : '18px' }}
      >
        <ConnectStatus />
        <div className="page-spy-devtools__panel">
          <ActiveContent />
        </div>
      </Content>
    </Layout>
  );
}
