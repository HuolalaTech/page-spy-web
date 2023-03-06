import { Col, Radio, Row } from 'antd';
import { useMemo, useRef, useState } from 'react';
import './index.less';
import hljs from 'highlight.js';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { ReactComponent as ClientSvg } from '@/assets/image/client.svg';
import { Trans, useTranslation } from 'react-i18next';

const SDKPanel = () => {
  const { t } = useTranslation();

  const SDK_CONTENT = useMemo(() => {
    return hljs.highlightAuto(
      `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    ...
    <!-- ${t('intro.first')} -->
    <script src="https://your-cdn.com/page-spy/dist/index.min.js"></script>

    <!-- ${t('intro.then')} -->
    <script>
      window.$pageSpy = new PageSpy({
        api: 'your-api-base.com',
        project: 'your-project-name'
      })
    </script>
  </head>
  <body>
    ...
  </body>
  <!-- ${t('intro.result')} -->
  <div id="__pageSpy">
  ...
  </div>
  </html>
  `,
    );
  }, [t]);

  return (
    <div className="sdk-panel">
      <pre>
        <code
          className="hljs language-html"
          dangerouslySetInnerHTML={{
            __html: SDK_CONTENT.value,
          }}
        />
      </pre>
    </div>
  );
};

const ClientPanel = () => {
  return (
    <div className="client-panel">
      <ClientSvg style={{ width: 700 }} />
    </div>
  );
};

const tabs = [
  { label: 'SDK', key: 'sdk' },
  { label: 'Client', key: 'client' },
];
export const Introduction = () => {
  const [activeTab, setActiveTab] = useState('sdk');
  const sdkRef = useRef(null);
  const clientRef = useRef(null);
  const nodeRef = activeTab === 'sdk' ? sdkRef : clientRef;

  return (
    <div className="introduction">
      <h2 className="introduction-title">
        <Trans i18nKey="intro.title">
          Out-of-box
          <br />
          SDK & Client
        </Trans>
      </h2>
      <Row justify="center">
        <Col>
          <Radio.Group
            buttonStyle="solid"
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value);
            }}
          >
            {tabs.map(({ label, key }) => {
              return (
                <Radio.Button key={key} value={key}>
                  {label}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Col>
      </Row>
      <div className="introduction-content flex-center">
        <SwitchTransition mode="out-in">
          <CSSTransition
            nodeRef={nodeRef}
            key={activeTab}
            classNames="fade"
            timeout={300}
          >
            <div ref={nodeRef}>
              {activeTab === 'sdk' ? <SDKPanel /> : <ClientPanel />}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
};
