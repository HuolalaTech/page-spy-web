import { Empty } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PCFrame, MobileFrame } from '../BrowserFrame';
import { useWSInfo } from '../WSInfo';
import './index.less';
import React from 'react';
import useSearch from '@/utils/useSearch';

const OS = ['IOS', 'Android'];

function insertStyle(doc: Document, text: string) {
  const style = doc.createElement('style');
  style.type = 'text/css';
  style.appendChild(doc.createTextNode(text));
  doc.head.appendChild(style);
}

const PagePanel = () => {
  const { pageMsg, refresh } = useWSInfo();
  const [loading, setLoading] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const { version } = useSearch();
  const os = useMemo(() => {
    const data = version!.split('-')[0];
    if (OS.indexOf(data) > -1) {
      return data;
    }
    return 'PC';
  }, [version]);
  useEffect(() => {
    setLoading(true);
    refresh('page');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const FrameWrapper = useMemo(() => {
    switch (os) {
      case 'IOS':
      case 'Android':
        return ({ children, ...props }: any) =>
          React.createElement(MobileFrame, { ...props, os }, children);
      case 'PC':
      default:
        return PCFrame;
    }
  }, [os]);

  useEffect(() => {
    if (pageMsg.length) {
      const frameDocument = frameRef.current!.contentDocument;
      frameDocument!.documentElement.innerHTML = pageMsg[0].html;

      insertStyle(frameDocument!, `a { pointer-events: none} `);
      const frameBody = frameDocument!.querySelector('body');
      frameBody?.addEventListener(
        'click',
        (e) => {
          e.stopPropagation();
        },
        true,
      );

      const spyRoot = frameDocument?.querySelector(
        '#__pageSpy',
      ) as HTMLDivElement;
      if (spyRoot) {
        spyRoot.style.fontSize = `14px`;
      }
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, [pageMsg]);

  if (pageMsg.length === 0) {
    return <Empty description={false} />;
  }

  return (
    <div className="page-panel">
      <div className="page-panel__content">
        <FrameWrapper
          loading={loading}
          onRefresh={() => {
            setLoading(true);
          }}
        >
          <iframe
            className="client-iframe"
            ref={frameRef}
            width="100%"
            height="100%"
            sandbox="allow-same-origin"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </FrameWrapper>
      </div>
    </div>
  );
};

export default PagePanel;
