import { ConfigProvider } from 'antd';
import React, { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import RouteConfig from './routes/config';
import zh from 'antd/es/locale/zh_CN';
import en from 'antd/es/locale/en_US';
import ja from 'antd/es/locale/ja_JP';
import ko from 'antd/es/locale/ko_KR';
import { langType, useLanguage } from './utils/useLanguage';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { Locale } from 'antd/es/locale';
import dayjs from 'dayjs';
import { CNUserModal } from './components/CNUserModal';
import { DocSearch } from './components/DocSearch';
import { DropFile } from './components/DropFile';
const localeConfig: Record<langType, Locale> = {
  zh,
  en,
  ja,
  ko,
};

export const App = () => {
  const [lang] = useLanguage();

  useEffect(() => {
    dayjs.locale(localeConfig[lang].locale);
  }, [lang]);

  return (
    <React.StrictMode>
      <HashRouter>
        <ErrorBoundary>
          <ConfigProvider
            locale={localeConfig[lang]}
            theme={{
              token: {
                colorLink: 'rgb(132, 52, 233)',
                colorPrimary: 'rgb(132, 52, 233)',
                colorPrimaryBg: 'rgb(247, 241, 255)',
              },
            }}
          >
            <CNUserModal />
            <RouteConfig />
            <DocSearch />
            <DropFile />
          </ConfigProvider>
        </ErrorBoundary>
      </HashRouter>
    </React.StrictMode>
  );
};
