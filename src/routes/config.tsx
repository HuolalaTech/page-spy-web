import { RouteObject } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';

import { Page404, To404 } from '@/404';
// import Devtools from '@/pages/Devtools';
import { Layouts } from '@/pages/Layouts';
import { Home } from '@/pages/Home';
import React from 'react';
import { RoomList } from '@/pages/RoomList';
import { Docs } from '@/pages/Docs';
import { Replay } from '@/pages/Replay';
import { LogList } from '@/pages/LogList';
import { ReplayLabs } from '@/pages/ReplayLabs';

const Devtools = React.lazy(() => import('@/pages/Devtools'));

export interface RouteInfo {
  icon?: any;
  name: string;
  hidden?: boolean;
  children?: (RouteInfo & RouteObject)[];
  redirectTo?: string;
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layouts />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/devtools',
        element: <Devtools />,
      },
      {
        path: '/room-list',
        element: <RoomList />,
      },
      {
        path: '/log-list',
        element: <LogList />,
      },
      {
        path: '/docs/*',
        element: <Docs />,
      },
      {
        path: '/replay',
        element: <Replay />,
      },
      {
        path: '/replay-labs',
        element: <ReplayLabs />,
      },
    ],
  },
  {
    path: '/404',
    element: <Page404 />,
  },
  {
    path: '*',
    element: <To404 />,
  },
];

const RouteConfig = () => {
  const routeContent = useRoutes(routes);

  return routeContent;
};

export default RouteConfig;
