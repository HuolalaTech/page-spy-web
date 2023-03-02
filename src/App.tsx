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
              colorPrimary: 'rgb(48, 30, 103)',
              colorPrimaryBg: 'rgba(160, 156, 166, 0.5)',
            },
          }}
        >
          <RouteConfing />
        </ConfigProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};
