import { Menu } from 'antd';
import {
  ComponentType,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConsoleActions, ConsolePanel } from '../ConsolePanel';
import { NetworkActions, NetworkPanel } from '../NetworkPanel';
import { SystemPanel } from '../SystemPanel';
import { StoragePanel } from '../StoragePanel';
import { throttle } from 'lodash-es';
import { ReplayStore, useReplayStore } from '@/store/replay';
import clsx from 'clsx';

export type MenuType = 'Console' | 'Network' | 'Storage' | 'System';

export const MENU_COMPONENTS: Record<
  MenuType,
  { Content: ComponentType; Extra?: ComponentType }
> = {
  Console: {
    Content: ConsolePanel,
    Extra: ConsoleActions,
  },
  Network: {
    Content: NetworkPanel,
    Extra: NetworkActions,
  },
  Storage: {
    Content: StoragePanel,
  },
  System: {
    Content: SystemPanel,
  },
};

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
  const handleStateUpdate = useCallback(
    (state: ReplayStore) => {
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
      const { Console, Network, Storage, System } = backwardDataSize.current;
      const result = {
        Console: Console !== current.Console,
        Network: Network !== current.Network,
        Storage: Storage !== current.Storage,
        System: System !== current.System,
      };
      setBadge(result);
    },
    [active],
  );
  useEffect(() => {
    // tab changes
    handleStateUpdate(useReplayStore.getState());
    // state changes
    const unFn = useReplayStore.subscribe(throttle(handleStateUpdate, 500));
    return unFn;
  }, [active, handleStateUpdate]);

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

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[active]}
      items={menuItems}
      style={{ border: 'none' }}
    />
  );
});
