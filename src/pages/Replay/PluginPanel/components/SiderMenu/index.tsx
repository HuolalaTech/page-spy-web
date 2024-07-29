import { Menu } from 'antd';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConsolePanel } from '../ConsolePanel';
import { NetworkPanel } from '../NetworkPanel';
import { SystemPanel } from '../SystemPanel';
import { StoragePanel } from '../StoragePanel';
import { throttle } from 'lodash-es';
import { ReplayStore, useReplayStore } from '@/store/replay';
import clsx from 'clsx';

export const MENU_COMPONENTS = {
  Console: {
    component: ConsolePanel,
  },
  Network: {
    component: NetworkPanel,
  },
  Storage: {
    component: StoragePanel,
  },
  System: {
    component: SystemPanel,
  },
} as const;

export type MenuType = keyof typeof MENU_COMPONENTS;

interface SiderMenuProps {
  active: MenuType;
}

export const SiderMenu = memo(({ active }: SiderMenuProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'devtool' });
  const navigate = useNavigate();
  const { search } = useLocation();
  const [badge, setBadge] = useState<Record<MenuType, boolean>>({
    Console: false,
    Network: false,
    Storage: false,
    System: false,
  });

  const backwardDataSize = useRef<Record<MenuType, number>>({
    Console: 0,
    Network: 0,
    Storage: 0,
    System: 0,
  });
  useEffect(
    () =>
      useReplayStore.subscribe(
        throttle((state: ReplayStore) => {
          const { Console, Network, Storage, System } =
            backwardDataSize.current;
          const current = {
            Console: state.consoleMsg.length,
            Network: state.networkMsg.length,
            Storage: Object.values(state.storageMsg).reduce(
              (acc, cur) => acc + cur.length,
              0,
            ),
            System: state.allSystemMsg.length,
          };
          backwardDataSize.current[active] = current[active];
          setBadge({
            Console: Console !== current.Console,
            Network: Network !== current.Network,
            Storage: Storage !== current.Storage,
            System: System !== current.System,
          });
        }, 500),
      ),
    [active],
  );

  const menuItems = useMemo(() => {
    return Object.entries(MENU_COMPONENTS).map(([key, item]) => {
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
                show: active !== key && badge[key as MenuType],
              })}
            />
          </div>
        ),
      };
    });
  }, [active, badge, navigate, search, t]);

  return <Menu mode="horizontal" selectedKeys={[active]} items={menuItems} />;
});
