import { DocMenus } from '../DocMenus';
import './index.less';
import { useRef } from 'react';
import { useClickAway } from 'ahooks';
import { useSidebarStore } from '@/store/doc-sidebar';
import clsx from 'clsx';

export const Sidebar = () => {
  const { show, setShow } = useSidebarStore();

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  useClickAway(() => {
    setShow(false);
  }, [sidebarRef, () => document.querySelector('.navigation-menus')]);
  return (
    <div
      className={clsx('sidebar', {
        show,
      })}
      ref={sidebarRef}
    >
      <DocMenus />
    </div>
  );
};
