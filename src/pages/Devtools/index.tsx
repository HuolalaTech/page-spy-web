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
import { resolveClientInfo } from '@/utils/brand';
import { useTranslation } from 'react-i18next';
import { ConnectStatus } from './ConnectStatus';
import { useSocketMessageStore } from '@/store/socket-message';

const { Sider, Content } = Layout;
const { Title } = Typography;

const MENUS = {
  Console: ConsolePanel,
  Network: NetworkPanel,
  Page: PagePanel,
  Storage: StoragePanel,
  System: SystemPanel,
};
type MenuKeys = keyof typeof MENUS;

interface BadgeMenuProps {
  active: MenuKeys;
}
const BadgeMenu = memo(({ active }: BadgeMenuProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'devtool' });
  const navigate = useNavigate();
  const { search } = useLocation();
  const [badge, setBadge] = useState<Record<MenuKeys, boolean>>({
    Console: false,
    Network: false,
    Page: false,
    Storage: false,
    System: false,
  });
  useEventListener('page-spy-updated', (evt) => {
    const { detail } = evt as CustomEvent;
    const type = `${(detail as string)[0].toUpperCase()}${detail.slice(
      1,
    )}` as MenuKeys;
    if (type !== active) {
      setBadge({
        ...badge,
        [type]: true,
      });
    }
  });

  useEffect(() => {
    setBadge((prev) => ({
      ...prev,
      [active]: false,
    }));
  }, [active]);

  const menuItems = useMemo(() => {
    return Object.keys(MENUS).map((item) => {
      return {
        key: item,
        label: (
          <div
            className="sider-menu__item"
            onClick={() => {
              navigate({ search, hash: item });
            }}
          >
            <span>{t(`menu.${item}`)}</span>
            <div
              className={clsx('circle-badge', {
                show: badge[item as MenuKeys],
              })}
            />
          </div>
        ),
      };
    });
  }, [badge, navigate, search, t]);

  return <Menu mode="inline" selectedKeys={[active]} items={menuItems} />;
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
          const { osLogo, browserLogo } = resolveClientInfo(item.name);
          return {
            osLogo,
            browserLogo,
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
        href={`${window.location.origin}/devtools?version=${item.name}&address=${item.address}&group=${item.group}`}
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
  const { version = '', address = '' } = useSearch();
  const clientInfo = useMemo(() => {
    if (!version) return null;
    return resolveClientInfo(version);
  }, [version]);

  return (
    <div className="client-info">
      <Title level={4} style={{ marginBlock: 12 }}>
        {t('device')}
      </Title>
      <Row wrap={false} align="middle" style={{ textAlign: 'center' }}>
        <Tooltip title={clientInfo?.osName}>
          <Col span={11}>
            <img className="client-info__logo" src={clientInfo?.osLogo} />
          </Col>
        </Tooltip>
        <Divider type="vertical" />
        <Tooltip
          title={
            <>
              <span>
                {t('browser')}: {clientInfo?.browserName}
              </span>
              <br />
              <span>
                {t('version')}: {clientInfo?.browserVersion}
              </span>
            </>
          }
        >
          <Col span={11}>
            <img className="client-info__logo" src={clientInfo?.browserLogo} />
          </Col>
        </Tooltip>
      </Row>
      <Divider type="horizontal" style={{ margin: '8px 0' }} />
      <Tooltip title="PageSpy ID">
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
  const { version = '', address = '' } = useSearch();
  const [socket, initSocket] = useSocketMessageStore((state) => [
    state.socket,
    state.initSocket,
  ]);
  useEffect(() => {
    if (socket) return;
    initSocket(address);
  }, [address, initSocket, socket]);

  const hashKey = useMemo<MenuKeys>(() => {
    const value = hash.slice(1);
    if (!(value in MENUS)) {
      return 'Console';
    }
    return value as MenuKeys;
  }, [hash]);

  const ActiveContent = useMemo(() => {
    const content = MENUS[hashKey];
    return content || ConsolePanel;
  }, [hashKey]);

  if (!(version && address)) {
    message.error('Error url params!');
    return null;
  }

  // eslint-disable-next-line consistent-return
  return (
    <Layout className="page-spy-devtools">
      <Sider theme="light">
        <div className="page-spy-devtools__sider">
          <ClientInfo />
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
