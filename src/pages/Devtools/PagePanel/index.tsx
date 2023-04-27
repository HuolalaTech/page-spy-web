import { Empty } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PCFrame, MobileFrame } from '../BrowserFrame';
import './index.less';
import React from 'react';
import useSearch from '@/utils/useSearch';
import { resolveClientInfo } from '@/utils/brand';
import { useSocketMessageStore } from '@/store/socket-message';

function insertStyle(doc: Document, text: string) {
  const style = doc.createElement('style');
  style.type = 'text/css';
  style.appendChild(doc.createTextNode(text));
  doc.head.appendChild(style);
}

const PagePanel = () => {
  const [html, refresh] = useSocketMessageStore((state) => [
    state.pageMsg.html,
    state.refresh,
  ]);
  const [loading, setLoading] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const { version } = useSearch();
  const os = useMemo(() => {
    const { osName } = resolveClientInfo(version);
    if (['iPhone', 'iPad'].indexOf(osName) >= 0) return 'iOS';
    if (osName === 'Android') return 'Android';
    return 'PC';
  }, [version]);

  useEffect(() => {
    setLoading(true);
    refresh('page');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const FrameWrapper = useMemo(() => {
    switch (os) {
      case 'iOS':
      case 'Android':
        return ({ children, ...props }: any) =>
          React.createElement(MobileFrame, { ...props, os }, children);
      case 'PC':
      default:
        return PCFrame;
    }
  }, [os]);

  useEffect(() => {
    if (html) {
      const frameDocument = frameRef.current!.contentDocument;
      frameDocument!.documentElement.innerHTML = html;

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
  }, [html]);

  if (!html) {
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
