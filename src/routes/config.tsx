import React from 'react';
import { RouteObject } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';

import { Page404, To404 } from '@/404';
import { Layouts } from '@/pages/Layouts';
import { Main } from '@/pages/Main';
import { OSpy } from '@/pages/OSpy';
import ProtectedRoute from '@/components/ProtectedRoute';

const Devtools = React.lazy(() => import('@/pages/Devtools'));
const RoomList = React.lazy(() => import('@/pages/RoomList'));
const MainDocs = React.lazy(() => import('@/pages/MainDocs'));
const Replay = React.lazy(() => import('@/pages/Replay'));
const LogList = React.lazy(() => import('@/pages/LogList'));
const OSpyDocs = React.lazy(() => import('@/pages/OSpyDocs'));

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
        element: <Main />,
      },
      {
        path: 'devtools',
        element: <Devtools />,
      },
      {
        path: 'room-list',
        element: (
          <ProtectedRoute>
            <RoomList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'log-list',
        element: (
          <ProtectedRoute>
            <LogList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'docs/*',
        element: <MainDocs />,
      },
      {
        path: 'replay',
        element: <Replay />,
      },
    ],
  },
  {
    path: '/o-spy',
    element: <Layouts />,
    children: [
      {
        index: true,
        element: <OSpy />,
      },
      {
        path: 'docs/*',
        element: <OSpyDocs />,
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
