import { ConfigProvider } from 'antd';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RouteConfing from './routes/config';
import zh from 'antd/es/locale/zh_CN';
import en from 'antd/es/locale/en_US';
import { useLanguage } from './utils/useLanguage';

export const App = () => {
  const [lang] = useLanguage();

  return (
    <React.StrictMode>
      <BrowserRouter>
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
      </BrowserRouter>
    </React.StrictMode>
  );
};
