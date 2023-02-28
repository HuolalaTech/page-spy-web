import { ConfigProvider } from 'antd';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RouteConfing from './routes/config';

export const App = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#301E67',
            },
          }}
        >
          <RouteConfing />
        </ConfigProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};
