import { RouteObject } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';

import { Page404, To404 } from '@/404';
import { Layouts } from '@/pages/Layouts';
import { Home } from '@/pages/Home';
import React from 'react';

const Devtools = React.lazy(() => import('@/pages/Devtools'));
const RoomList = React.lazy(() => import('@/pages/RoomList'));
const Docs = React.lazy(() => import('@/pages/Docs'));
const Replay = React.lazy(() => import('@/pages/Replay'));
const LogList = React.lazy(() => import('@/pages/LogList'));
const ReplayLabs = React.lazy(() => import('@/pages/ReplayLabs'));

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
