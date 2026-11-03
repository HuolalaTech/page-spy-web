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
import PluginPanel from './PluginPanel';
import {
  collectPanels,
  extractPluginInterfaces,
  type RegisteredPanel,
} from '@/store/socket-message/plugin-interface';
const { Sider, Content } = Layout;
const { Title } = Typography;

/**
 * Panels published by *client* plugins, in sidebar order.
 *
 * A client's `client-info` can carry interfaces alongside bare plugin names; each
 * interface lists panels the client wants this debugger to render, where to load them
 * from, and which message types they tunnel. Nothing here knows what any of them do —
 * adding a panel is a plugin's job, not an edit to this file.
 *
 * Read-only and pure: message-type registration happens where `client-info` arrives
 * (see `store/socket-message`), so a plugin's frames are accepted from the moment its
 * interface is known rather than from the moment something renders.
 */
function useDebuggerPanels(): RegisteredPanel[] {
  const plugins = useSocketMessageStore(
    useShallow((state) => state.clientInfo?.plugins),
  );
  return useMemo(() => collectPanels(extractPluginInterfaces(plugins)), [plugins]);
}

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
  active: string;
}
const BadgeMenu = memo(({ active }: BadgeMenuProps) => {
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
      // A message type is not a menu entry: 'my-data' camelises to 'My-data', which
      // would add a junk key on every frame of a high-frequency plugin stream. Only
      // real entries get badges, and the guard must live inside the updater because
      // that is the only place the previous state is in scope.
      setBadge((prev) =>
        type === active || !(type in prev) ? prev : { ...prev, [type]: true },
      );
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
  const pluginPanels = useDebuggerPanels();

  const menuItems = useMemo(() => {
    if (!clientInfo) return;

    const builtin = Object.entries(MENU_COMPONENTS)
      .filter(([, item]) => {
        // Menu filter by some conditions``
        return (
          !item.visible ||
          item.visible({
            browser: clientInfo.browser.type,
            os: clientInfo.os.type,
          })
        );
      })
      .map(([key, item]) => ({ key, label: t(`menu.${key}`), order: -1 }));

    // Plugin panels are the client's, so their labels are literal text the plugin
    // ships rather than keys in this app's locale files.
    const plugins = pluginPanels
      .filter(
        ({ panel }) => !panel.browserOnly || isBrowser(clientInfo.browser.type),
      )
      .map(({ panel }) => ({
        key: panel.key,
        label: panel.title,
        order: panel.order ?? 100,
      }));

    return [...builtin, ...plugins]
      .sort((a, b) => a.order - b.order)
      .map(({ key, label }) => ({
        key,
        label: (
          <div
            className="sider-menu__item"
            onClick={() => {
              navigate({ search, hash: key });
            }}
          >
            <span>{label}</span>
            <div
              className={clsx('circle-badge', {
                show: badge[key as MenuType],
              })}
            />
          </div>
        ),
      }));
  }, [clientInfo, pluginPanels, badge, navigate, search, t]);

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

  useEffect(() => {
    if (socket) return;
    initSocket({ address, secret });
  }, [address, initSocket, secret, socket]);

  const pluginPanels = useDebuggerPanels();

  /**
   * The active panel key. `#PluginKey` works for plugin panels exactly as `#Console`
   * does for built-ins, so a plugin gets a route without the host hardcoding one.
   */
  const hashKey = useMemo<string>(() => {
    const value = hash.slice(1);
    if (value in MENU_COMPONENTS) return value;
    if (pluginPanels.some(({ panel }) => panel.key === value)) return value;
    return 'Console';
  }, [hash, pluginPanels]);

  const activePlugin = useMemo(
    () => pluginPanels.find(({ panel }) => panel.key === hashKey),
    [pluginPanels, hashKey],
  );

  const ActiveContent = useMemo(() => {
    // Plugin panels are loaded and mounted by the host; it needs no knowledge of
    // what they render.
    if (activePlugin) {
      return () => <PluginPanel registered={activePlugin} />;
    }
    const content = MENU_COMPONENTS[hashKey as MenuType];
    return content.component || ConsolePanel;
  }, [hashKey, activePlugin]);

  if (!address) {
    message.error('Error url params!');
    return null;
  }

  // eslint-disable-next-line consistent-return
  return (
    <Layout className="page-spy-devtools">
      <Sider theme="light">
        <div className="page-spy-devtools__sider">
          <ClientInfo />
          {clientInfo?.plugins?.includes('MPEvalPlugin') && (
            <MPWarning className="sider-warning" />
          )}
          <BadgeMenu active={hashKey} />
        </div>
      </Sider>
      <Content className="page-spy-devtools__content">
        <ConnectStatus />
        <div className="page-spy-devtools__panel">
          <ActiveContent />
        </div>
      </Content>
    </Layout>
  );
}
