import { Empty } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { PCFrame } from '../BrowserFrame';
import './index.less';
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

  useEffect(() => {
    if (html) {
      const frameDocument = frameRef.current!.contentDocument;
      frameDocument!.write(html.toString());

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
        <PCFrame
          loading={loading}
          onRefresh={() => {
            setLoading(true);
            refresh('page');
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
        </PCFrame>
      </div>
    </div>
  );
};

export default PagePanel;
