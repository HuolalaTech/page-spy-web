import React, { useEffect, useMemo, useState } from 'react';
import './index.less';
import {
  Button,
  Descriptions,
  Divider,
  Form,
  Input,
  Popover,
  Tabs,
} from 'antd';
import ReactJsonView from '@huolala-tech/react-json-view';
import { SpyMPPage, SpyMessage } from '@huolala-tech/page-spy-types';
import { useSocketMessageStore } from '@/store/socket-message';
import { MPPageInfo } from '@huolala-tech/page-spy-types/lib/mp-page';
import { ReloadOutlined } from '@ant-design/icons';
import { EntriesBody } from '@/components/EntriesBody';
import DetailBlock from '@/components/DetailBlock';
import PageMethodPanel from './components/MethodPanel';
import MPDom from './components/MPDom';
import { useTranslation } from 'react-i18next';

type Props = {};

function buildQueryString(data: Record<string, any> = {}) {
  return Object.keys(data)
    .map((key) => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');
}

const MPPanel = (props: Props) => {
  const [socket] = useSocketMessageStore((state) => [
    state.socket,
    state.refresh,
  ]);
  const mpPages = useSocketMessageStore((state) => state.mpPageMsg);
  const { t } = useTranslation('translation', { keyPrefix: 'mp-page' });

  const [pageId, setPageId] = useState<number | null>(null);

  useEffect(() => {
    if (socket) {
      socket?.unicastMessage({
        type: 'mp-page-stack',
      });
    }
  }, [socket]);

  useEffect(() => {
    if (pageId !== null && !mpPages.stack.find((p) => p.id === pageId)) {
      setPageId(null);
    }
    if (mpPages.stack.length > 0 && pageId === null) {
      getPageInfo(mpPages.stack[0].id);
    }
    console.log('stack changed');
  }, [mpPages.stack]);

  const sendUnicast = (type: SpyMessage.InteractiveType, data: any) => {
    socket?.unicastMessage({
      type,
      data,
    });
  };

  const getPageDetail = (id: number) => {
    sendUnicast('mp-page-detail', { id });
  };

  const getPageDom = (id: number) => {
    sendUnicast('mp-page-dom', { id });
  };

  // const callMethod = (name: string, params: any[] = []) => {
  //   sendUnicast('mp-page-method-call', {
  //     page: currentRoute,
  //     name,
  //     params,
  //   });
  // };

  const getPageInfo = (id: number) => {
    setPageId(id);
    getPageDetail(id);
    getPageDom(id);
  };

  const currentPage = useMemo(() => {
    return mpPages.stack.find((item) => item.id === pageId);
  }, [pageId, mpPages.stack]);

  return (
    <div className="mp-panel">
      <div className="mp-page">
        <div className="mp-page-stack">
          <div className="title">
            <span>{t('page-stack')}</span>{' '}
            <Button
              onClick={() => {
                socket?.unicastMessage({
                  type: 'mp-page-stack',
                });
              }}
              icon={<ReloadOutlined />}
            />
          </div>
          {mpPages.stack.map((item, index) => {
            return (
              <div
                key={item.route + index}
                className={`mp-page-item ${pageId === item.id ? 'active' : ''}`}
                onClick={() => getPageInfo(item.id)}
              >
                <div className="mp-page-route">{item.route}</div>
                <div className="mp-page-query">
                  {buildQueryString(item.options || {})}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mp-page-detail">
          <Tabs
            style={{ height: '100%' }}
            tabBarExtraContent={
              pageId !== null && (
                <Button
                  onClick={() => {
                    getPageInfo(pageId);
                  }}
                  icon={<ReloadOutlined />}
                />
              )
            }
          >
            <Tabs.TabPane tab="Elements" key="elements">
              <MPDom dom={currentPage?.dom} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="App Data" key="state">
              <DetailBlock title="Options">
                <EntriesBody
                  data={Object.entries(currentPage?.options || {})}
                />
              </DetailBlock>
              <DetailBlock title="Data">
                <ReactJsonView
                  defaultExpand
                  stringEllipse={false}
                  source={currentPage?.data || {}}
                />
              </DetailBlock>
            </Tabs.TabPane>
            {/* <Tabs.TabPane tab="Methods" tabKey="methods" key={'methods'}>
              <PageMethodPanel
                sendUnicast={sendUnicast}
                route={currentPage?.route}
                methods={currentPage?.methods || []}
              />
            </Tabs.TabPane> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MPPanel;
