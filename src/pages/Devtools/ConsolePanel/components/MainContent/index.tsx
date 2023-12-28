import { useSocketMessageStore } from '@/store/socket-message';
import { DoubleRightOutlined } from '@ant-design/icons';
import { Row, Col, Button } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import ConsoleNode from '../ConsoleNode';
import {
  isPlaceholderNode,
  PlaceholderNode,
} from '../ConsoleNode/PlaceholderNode';
import { isErrorTraceNode, ErrorTraceNode } from '../ConsoleNode/ErrorTrace';
import LogType from '../LogType';
import Timestamp from '../Timestamp';
import { useTranslation } from 'react-i18next';

export const MainContent = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'console' });

  const containerEl = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = useCallback(() => {
    const container = containerEl.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight - container.offsetHeight,
      behavior: 'smooth',
    });
  }, []);

  const [data, dataFilter] = useSocketMessageStore((state) => [
    state.consoleMsg,
    state.consoleMsgTypeFilter,
  ]);
  const [newTips, setNewTips] = useState<boolean>(false);
  useEffect(() => {
    if (data.length === 0) {
      setNewTips(false);
    }
  }, [data]);
  useEffect(() => {
    const logType = [...data].pop()?.logType || '';
    const isDebug = ['debug-origin', 'debug-eval'].includes(logType);
    const evalError =
      data.length > 1 && data[data.length - 2].logType === 'debug-origin';
    if (isDebug || evalError) {
      scrollToBottom();
    } else {
      const container = containerEl.current;
      if (!container) return;

      const { offsetHeight, scrollHeight } = container;
      if (scrollHeight > offsetHeight) {
        setNewTips(true);
      }
    }
  }, [data, scrollToBottom]);

  useEffect(() => {
    const container = containerEl.current;
    if (!container) return;

    const fn = () => {
      const { offsetHeight, scrollTop, scrollHeight } = container;
      if (scrollHeight > offsetHeight) {
        if (scrollTop + offsetHeight > scrollHeight - 30) {
          setNewTips(false);
        }
      }
    };

    container.addEventListener('scrollend', fn);
    return () => {
      container.removeEventListener('scrollend', fn);
    };
  }, []);

  function getLogUrl(url?: string) {
    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return url;
      }
      try {
        return url.substring(new URL(url).origin.length);
      } catch (e) {
        return '/';
      }
    }
    return '/';
  }
  const consoleDataList = dataFilter.length
    ? data.filter((item) => dataFilter.includes(item.logType))
    : data;

  return (
    <div className="console-list" ref={containerEl}>
      {consoleDataList.map((item) => (
        <div className={`console-item ${item.logType}`} key={item.id}>
          <div className="console-item__title">
            <LogType type={item.logType} />
          </div>
          <div className="console-item__content">
            <Row gutter={12} wrap={false}>
              <Col style={{ flexShrink: 0 }}>
                <Timestamp time={item.time} />
              </Col>
              <Col flex={1}>
                {isPlaceholderNode(item) ? (
                  <PlaceholderNode data={item.logs} />
                ) : isErrorTraceNode(item) ? (
                  <ErrorTraceNode data={item} />
                ) : (
                  item.logs?.map((log) => {
                    return <ConsoleNode data={log} key={log.id} />;
                  })
                )}
              </Col>
            </Row>
          </div>
          <div className="console-item__url" title={item.url}>
            {getLogUrl(item.url)}
          </div>
        </div>
      ))}
      {newTips && (
        <div className="console-list__new" onClick={scrollToBottom}>
          <Button shape="round" type="primary">
            <DoubleRightOutlined rotate={90} />
            <span>{t('newContent')}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
