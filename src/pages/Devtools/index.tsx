import {
  Col,
  Divider,
  Empty,
  Layout,
  Menu,
  message,
  Row,
  Tooltip,
  Typography,
} from 'antd';
import React, { memo, useEffect, useMemo, useState } from 'react';
import ConsolePanel from './ConsolePanel';
import NetworkPanel from './NetworkPanel';
import SystemPanel from './SystemPanel';
import { useNavigate, useLocation } from 'react-router-dom';
import PagePanel from './PagePanel';
import { DownOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { getSpyRoom } from '@/apis';
import clsx from 'clsx';
import './index.less';
import { StoragePanel } from './StoragePanel';
import useSearch from '@/utils/useSearch';
import { useEventListener } from '@/utils/useEventListener';
import { parseUserAgent, useClientInfoFromMsg } from '@/utils/brand';
import { useTranslation } from 'react-i18next';
import { ConnectStatus } from './ConnectStatus';
import { useSocketMessageStore } from '@/store/socket-message';
import '@huolala-tech/react-json-view/dist/style.css';
import { throttle } from 'lodash-es';
import { CUSTOM_EVENT } from '@/store/socket-message/socket';
import { SpyDevice } from '@huolala-tech/page-spy-types';
import MPWarning from '@/components/MPWarning';

const { Sider, Content } = Layout;
const { Title } = Typography;

type MenuType = 'Console' | 'Network' | 'Page' | 'Storage' | 'System';

const MENU_COMPONENTS: Record<
  MenuType,
  {
    component: React.FC;
    visible?: (params: {
      browser: SpyDevice.Browser;
      os: SpyDevice.OS;
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
    visible: (params) => {
      return (
        params.os !== 'harmony' &&
        !params.browser?.startsWith('mp-') &&
        params.browser !== 'uni-native'
      );
    },
  },
  Storage: {
    component: StoragePanel,
    visible: (params) => {
      return params.os !== 'harmony';
    },
  },
  System: {
    component: SystemPanel,
    visible: (params) => {
      return (
        params.os !== 'harmony' &&
        !params.browser?.startsWith('mp-') &&
        params.browser !== 'uni-native'
      );
    },
  },
};

interface BadgeMenuProps {
  active: MenuType;
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

  const clientInfo = useClientInfoFromMsg();

  const menuItems = useMemo(() => {
    if (!clientInfo) return [];
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
  }, [clientInfo, badge, navigate, search, t]);

  return (
    <Menu
      className="sider-menu"
      mode="inline"
      selectedKeys={[active]}
      items={menuItems}
    />
  );
});

interface SiderRoomProps {
  exclude: string;
}
const SiderRooms: React.FC<SiderRoomProps> = ({ exclude }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { group } = useSearch();
  const { data } = useRequest(
    async () => {
      const res = await getSpyRoom(group);
      return res.data.filter((item) => {
        return (
          item.address !== exclude &&
          item.connections &&
          item.connections.length > 0
        );
      });
    },
    {
      pollingInterval: 2000,
      pollingWhenHidden: false,
      onError(err) {
        message.error(err.message);
      },
    },
  );

  const rooms = useMemo(() => {
    const result =
      data
        ?.filter((item) => item.name && item.address)
        .map((item) => {
          const clientInfo = parseUserAgent(item.name);
          return {
            osLogo: clientInfo.os.logo,
            browserLogo: clientInfo.browser.logo,
            name: item.name,
            address: item.address,
            group: item.group,
          };
        }) || [];
    if (result.length === 0) {
      return <Empty description={false} imageStyle={{ height: 50 }} />;
    }
    return result.map((item) => (
      <a
        key={item.address}
        className="room-item"
        href={`${window.location.origin}/devtools?address=${item.address}&group=${item.group}`}
      >
        <div className="room-item__os">
          <img src={item.osLogo} className="client-icon" />
        </div>
        <div className="room-item__browser">
          <img src={item.browserLogo} className="client-icon" />
        </div>
        <div className="room-item__address">
          <code>{item.address.slice(0, 4)}</code>
        </div>
      </a>
    ));
  }, [data]);

  return (
    <div
      className={clsx('sider-rooms', {
        collapsed,
      })}
    >
      <div
        className="sider-rooms__title"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Title level={4}>Rooms</Title>
        <div className="trigger-icon">
          <DownOutlined />
        </div>
      </div>
      <div className="sider-rooms__content">
        <div className="room-list">{rooms}</div>
      </div>
    </div>
  );
};

const ClientInfo = memo(() => {
  const { t } = useTranslation('translation', { keyPrefix: 'devtool' });
  const { address = '' } = useSearch();
  const clientInfo = useClientInfoFromMsg();

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
                {t('browser')}: {clientInfo?.browser.name}
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
  const [socket, initSocket] = useSocketMessageStore((state) => [
    state.socket,
    state.initSocket,
  ]);

  const clientInfo = useClientInfoFromMsg();

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
      <Sider theme="light">
        <div className="page-spy-devtools__sider">
          <ClientInfo />
          {clientInfo?.browser.type.startsWith('mp-') && (
            <MPWarning className="sider-warning" />
          )}
          <BadgeMenu active={hashKey} />
          {/* <div className="page-spy-devtools__sider-bottom">
            <SiderRooms exclude={address} />
          </div> */}
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
