import './index.less';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Welcome } from './components/Welcome';
import Icon from '@ant-design/icons';
import { Flex } from 'antd';
import PrevSvg from '@/assets/image/prev.svg?react';
import NextSvg from '@/assets/image/next.svg?react';
import { useStepStore } from './components/store';
import { ImportPackage } from './components/ImportPackage';
import { ReplayInLab } from './components/ReplayInLab';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import WholeBundle from '@huolala-tech/page-spy-plugin-whole-bundle';
import '@huolala-tech/page-spy-plugin-whole-bundle/dist/index.css';

const translations = [
  '你好，我是 PageSpy。', // 中文 (简体中文)
  'Hello, I am PageSpy.', // 英语 (English)
  'Hola, soy PageSpy.', // 西班牙语 (Español)
  'Bonjour, je suis PageSpy.', // 法语 (Français)
  'Hallo, ich bin PageSpy.', // 德语 (Deutsch)
  'Olá, eu sou o PageSpy.', // 葡萄牙语 (Português)
  'Привет, я PageSpy.', // 俄语 (Русский)
  'مرحبًا، أنا PageSpy.', // 阿拉伯语 (العربية)
];

const ReplayLab = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'lab' });
  const { current, prev, next } = useStepStore();
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const feedback = useRef<WholeBundle | null>(null);
  useEffect(() => {
    feedback.current = new WholeBundle();
    return () => {
      feedback.current?.abort();
      feedback.current = null;
    };
  }, []);
  useEffect(() => {
    const $feedback = feedback.current;
    if (!$feedback) return;

    const { root } = $feedback;
    if (root) {
      if (current !== 1) {
        root.style.display = 'none';
      } else {
        root.style.display = 'block';
      }
    }
    if (current === 2) {
      $feedback.$harbor?.pause();
    } else {
      $feedback.$harbor?.resume();
    }
  }, [current]);

  const consoleTimer = useRef<number | null>(null);
  useEffect(() => {
    let index = 0;
    const { length } = translations;
    consoleTimer.current = setInterval(() => {
      console.log(`${translations[index++ % length]}`);
    }, 1000);
    return () => {
      if (consoleTimer.current) {
        clearInterval(consoleTimer.current);
        consoleTimer.current = null;
      }
    };
  }, []);

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
      {current !== 2 && (
        <Flex justify="center" align="center" className="step-actions" gap={8}>
          <Icon
            className="step-actions__item"
            component={PrevSvg}
            disabled={current === 0}
            onClick={prev}
          />
          <b>
            {current + 1} - {contents[current].title}
          </b>
          <Icon
            className="step-actions__item"
            component={NextSvg}
            disabled={current === contents.length - 1}
            onClick={next}
          />
        </Flex>
      )}
    </div>
  );
};

export default ReplayLab;
