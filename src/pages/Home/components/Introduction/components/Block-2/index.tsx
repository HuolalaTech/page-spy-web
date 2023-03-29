import { Row, Col, Typography } from 'antd';
import debugImg from '@/assets/image/debugger.png';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { PropsWithChildren, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';
import { Trans, useTranslation } from 'react-i18next';
import { version as sdkVersion } from '@huolala-tech/page-spy/package.json';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const ToggleKey = ({
  isActive,
  children,
  onClick,
}: PropsWithChildren<{ isActive: boolean; onClick: () => void }>) => {
  return (
    <span
      className={clsx('toggle-key', {
        active: isActive,
      })}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

const SDKPanel = () => {
  const { t } = useTranslation('translation');
  const steps = useMemo(() => {
    return [
      {
        title: `1. ${t('intro.loadStep1')}`,
        code: `<script crossorgin="anonymous" src="${window.location.origin}/page-spy@${sdkVersion}/index.min.js"></script>`,
      },
      {
        title: (
          <span>
            2.{' '}
            <Trans i18nKey="intro.loadStep2">
              Then, <Link to="/docs">config (optional)</Link> and init
            </Trans>
          </span>
        ),
        code: `<script>
  new PageSpy([config]);
</script>`,
      },
      {
        title: `3. ${t('intro.loadStep3')}`,
        code: '',
      },
    ];
  }, [t]);

  return (
    <div className="sdk-panel">
      {steps.map(({ title, code }, index) => {
        return (
          <div className="sdk-step" key={index}>
            <p className="sdk-step__title">{title}</p>
            <CodeBlock code={code} codeType="language-javascript" />
          </div>
        );
      })}
    </div>
  );
};

const ClientPanel = () => {
  return (
    <div className="client-panle">
      <img width={400} src={debugImg} alt="" />
    </div>
  );
};

export const IntroBlock2 = () => {
  const { t } = useTranslation();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [activeKey, setActiveKey] = useState('sdk');

  return (
    <Row justify="center" gutter={80}>
      <Col>
        <p className="small-title">{t('intro.provides')}</p>
        <Title level={1} className="big-title">
          <Trans i18nKey="intro.providesTitle">
            Out-of-box
            <ToggleKey
              isActive={activeKey === 'sdk'}
              onClick={() => setActiveKey('sdk')}
            >
              SDK
            </ToggleKey>
            and <br />
            <ToggleKey
              isActive={activeKey === 'debugger'}
              onClick={() => setActiveKey('debugger')}
            >
              debugger client
            </ToggleKey>
          </Trans>
        </Title>
      </Col>
      <Col>
        <SwitchTransition mode="out-in">
          <CSSTransition
            nodeRef={nodeRef}
            key={activeKey}
            classNames="fade"
            timeout={300}
          >
            <div ref={nodeRef} style={{ width: 400, height: 400 }}>
              {activeKey === 'sdk' ? <SDKPanel /> : <ClientPanel />}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </Col>
    </Row>
  );
};
