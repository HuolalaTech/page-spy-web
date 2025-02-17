import { Typography } from 'antd';
import debugImg from '@/assets/image/screenshot/console-panel.png';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { PropsWithChildren, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';
import { Trans, useTranslation } from 'react-i18next';

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
        title: t('intro.load-script'),
        code: `<script crossorigin="anonymous" src="https://{domain}/page-spy/index.min.js"></script>`,
      },
      {
        title: t('intro.init-instance'),
        code: `<script>
  new PageSpy();
</script>`,
      },
      {
        title: t('inject.end'),
        code: '',
      },
    ];
  }, [t]);

  return (
    <div className="sdk-panel">
      {steps.map(({ title, code }, index) => {
        return (
          <div className="sdk-step" key={index}>
            <p className="sdk-step__title">
              {index + 1}. {title}
            </p>
            {!!code && <CodeBlock code={code} />}
          </div>
        );
      })}
    </div>
  );
};

const ClientPanel = () => {
  return (
    <div className="client-panel">
      <img src={debugImg} alt="" />
    </div>
  );
};

export const IntroBlock2 = () => {
  const { t } = useTranslation();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [activeKey, setActiveKey] = useState('sdk');

  return (
    <div className="intro-block block-2">
      <div className="intro-block__title">
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
      </div>
      <SwitchTransition mode="out-in">
        <CSSTransition
          nodeRef={nodeRef}
          key={activeKey}
          classNames="fade"
          timeout={300}
        >
          <div ref={nodeRef} style={{ maxWidth: '100%' }}>
            {activeKey === 'sdk' ? <SDKPanel /> : <ClientPanel />}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
};
