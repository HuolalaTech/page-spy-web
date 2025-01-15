import './index.less';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Welcome } from './components/Welcome';
import Icon from '@ant-design/icons';
import { Flex } from 'antd';
import PrevSvg from '@/assets/image/prev.svg?react';
import NextSvg from '@/assets/image/next.svg?react';
import { useStepStore } from './components/store';
import { ImportPackage } from './components/ImportPackage';
import { Customize } from './components/Customize';
import { ReplayInLab } from './components/ReplayInLab';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { useEventListener } from '@/utils/useEventListener';

const ReplayLab = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'lab' });
  const { current, prev, next } = useStepStore();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  useEventListener('wheel', (e: Event) => {
    const isNext = (e as WheelEvent).deltaY > 0;
    if (isNext) {
      next();
    } else {
      prev();
    }
  });

  const contents = useMemo(() => {
    return [
      {
        title: t('welcome'),
        content: <Welcome />,
      },
      {
        title: t('install'),
        content: <ImportPackage />,
      },
      {
        title: t('customize'),
        content: <Customize />,
      },
      {
        title: t('replay'),
        content: <ReplayInLab />,
      },
    ];
  }, [t]);

  return (
    <div className="replay-lab">
      <SwitchTransition mode="out-in">
        <CSSTransition
          nodeRef={nodeRef}
          classNames="fade"
          timeout={300}
          key={contents[current].title}
        >
          <div style={{ height: '100%' }} ref={nodeRef}>
            {contents[current].content}
          </div>
        </CSSTransition>
      </SwitchTransition>
      <Flex className="step-actions" gap={8}>
        <Icon
          component={PrevSvg}
          style={{ fontSize: 32 }}
          disabled={current === 0}
          onClick={prev}
        />
        <b>
          {current + 1} - {contents[current].title}
        </b>
        <Icon
          component={NextSvg}
          style={{ fontSize: 32 }}
          disabled={current === contents.length - 1}
          onClick={next}
        />
      </Flex>
    </div>
  );
};

export default ReplayLab;
