import { ConfigProvider } from 'antd';
import React from 'react';
import { HashRouter } from 'react-router-dom';
import RouteConfig from './routes/config';
import zh from 'antd/es/locale/zh_CN';
import en from 'antd/es/locale/en_US';
import { useLanguage } from './utils/useLanguage';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App = () => {
  const [lang] = useLanguage();

  return (
    <React.StrictMode>
      <HashRouter>
        <ErrorBoundary>
          <ConfigProvider
            locale={lang === 'zh' ? zh : en}
            theme={{
              token: {
                colorPrimary: 'rgb(132, 52, 233)',
                colorPrimaryBg: 'rgb(247, 241, 255)',
              },
            }}
          >
            <RouteConfig />
          </ConfigProvider>
        </ErrorBoundary>
      </HashRouter>
    </React.StrictMode>
  );
};
