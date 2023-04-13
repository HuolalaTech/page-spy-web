import { ConfigProvider } from 'antd';
import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import RouteConfing from './routes/config';
import zh from 'antd/es/locale/zh_CN';
import en from 'antd/es/locale/en_US';
import { useLanguage } from './utils/useLanguage';

const isDoc = import.meta.env.MODE === 'doc';
const basename = isDoc ? '/page-spy-web' : '/';
const Router = BrowserRouter;

export const App = () => {
  const [lang] = useLanguage();

  return (
    <React.StrictMode>
      <Router basename={basename}>
        <ConfigProvider
          locale={lang === 'zh' ? zh : en}
          theme={{
            token: {
              colorPrimary: 'rgb(132, 52, 233)',
              colorPrimaryBg: 'rgb(247, 241, 255)',
            },
          }}
        >
          <RouteConfing />
        </ConfigProvider>
      </Router>
    </React.StrictMode>
  );
};
