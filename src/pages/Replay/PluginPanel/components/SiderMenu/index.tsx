import { Menu } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConsolePanel } from '../ConsolePanel';
import { NetworkPanel } from '../NetworkPanel';
import { SystemPanel } from '../SystemPanel';

export const MENU_COMPONENTS = {
  Console: {
    component: ConsolePanel,
  },
  Network: {
    component: NetworkPanel,
  },
  // Storage: {
  //   component: StoragePanel,
  // },
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
          </div>
        ),
      };
    });
  }, [navigate, search, t]);

  return <Menu mode="horizontal" selectedKeys={[active]} items={menuItems} />;
});
