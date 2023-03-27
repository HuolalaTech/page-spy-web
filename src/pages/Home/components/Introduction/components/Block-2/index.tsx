import { Row, Col, Typography } from 'antd';
import debugImg from '@/assets/image/debugger.png';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { PropsWithChildren, useRef, useState } from 'react';
import clsx from 'clsx';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';

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
  const steps = [
    {
      title: '1. Import script in the testing project',
      code: '<script src="https://your-cdn.com/path/to/page-spy.js"></script>',
    },
    {
      title: '2. Then, config PageSpy and init',
      code: `<script>
  new PageSpy({
    api: '<api-base-host>', // for example, "example.com"
    clientOrigin: '<debugger-ui-client-origin>' // for example, "https://example.com"
  })
</script>`,
    },
    {
      title: "3. That's ALL!",
      code: '',
    },
  ];

  return (
    <div className="sdk-panel">
      {steps.map(({ title, code }) => {
        return (
          <div className="sdk-step" key={title}>
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
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [activeKey, setActiveKey] = useState('sdk');

  return (
    <Row justify="center" gutter={80}>
      <Col>
        <p className="small-title">What we provide</p>
        <Title level={1} className="big-title">
          Out-of-box{' '}
          <ToggleKey
            isActive={activeKey === 'sdk'}
            onClick={() => setActiveKey('sdk')}
          >
            SDK
          </ToggleKey>{' '}
          and <br />
          <ToggleKey
            isActive={activeKey === 'debugger'}
            onClick={() => setActiveKey('debugger')}
          >
            debugger client
          </ToggleKey>
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
