import React, { useEffect, useMemo, useState } from 'react';
import './index.less';
import {
  Button,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Popover,
  Row,
  Tabs,
  Tag,
  Tooltip,
  Typography,
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
  const { pages } = useSocketMessageStore((state) => state.mpPageMsg);
  const { t } = useTranslation();

  const [pageId, setPageId] = useState<number | null>(null);

  useEffect(() => {
    if (socket) {
      socket?.unicastMessage({
        type: 'mp-page-stack',
      });
    }
  }, [socket]);

  useEffect(() => {
    if (pageId !== null && !pages.find((p) => p.id === pageId)) {
      setPageId(null);
    }
    if (pages.length > 0 && pageId === null) {
      getPageInfo(pages[0].id);
    }
    console.log('stack changed');
  }, [pages, pageId]);

  const sendUnicast = (type: SpyMessage.InteractiveType, data: any) => {
    socket?.unicastMessage({
      type,
      data,
    });
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
  };

  const currentPage = useMemo(() => {
    return pages.find((page) => page.id === pageId);
  }, [pageId, pages]);

  const refresh = useSocketMessageStore((state) => state.refresh);

  return (
    <div className="mp-panel">
      <Row justify="end" style={{ marginBottom: 8 }}>
        <Col>
          <Tooltip title={t('common.refresh')}>
            <Button
              onClick={() => {
                refresh('page');
              }}
            >
              <ReloadOutlined />
            </Button>
          </Tooltip>
        </Col>
      </Row>
      <div className="mp-page">
        <div className="mp-page-stack">
          <div className="title">
            <span>{t('mppage.page-stack')}</span>{' '}
          </div>
          {[...pages].reverse().map((page, index) => {
            return (
              <div
                key={page.route + index}
                className={`mp-page-item ${pageId === page.id ? 'active' : ''}`}
                onClick={() => getPageInfo(page.id)}
              >
                <div className="mp-page-index">{index + 1}.</div>
                <div className="mp-page-route">
                  <div>
                    {page.route}
                    {index === 0 && (
                      <Tag
                        style={{ marginLeft: 6 }}
                        color="purple"
                        bordered={false}
                      >
                        {t('mppage.current')}
                      </Tag>
                    )}
                  </div>
                  {/* {
                    index === 0 &&  <div style={{marginTop: 6}} >
                      <Tag className='mp-page-tag' color='purple' bordered={false} >{t('mppage.current')}</Tag>
                    </div>
                    
                  } */}
                </div>

                <div className="mp-page-query">
                  {/* {buildQueryString(page.options || {})} */}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mp-page-detail">
          <Tabs style={{ height: '100%' }}>
            {
              // currently only mp-wechat built with uniapp is supported
              // clientInfo?.framework === 'uniapp' &&
              //   clientInfo?.browser.type === 'mp-wechat' && (
              //   )
              // <Tabs.TabPane tab="Elements" key="elements">
              //   <MPDom dom={currentPage?.dom} />
              // </Tabs.TabPane>
            }
            <Tabs.TabPane tab="App Data" key="state">
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
