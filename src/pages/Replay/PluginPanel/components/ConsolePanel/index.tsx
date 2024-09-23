import { ConsoleItem } from '@/components/ConsoleItem';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ConfigProvider } from '@/components/ConfigProvider';
import { useTranslation } from 'react-i18next';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { Tooltip, Button } from 'antd';

export const ConsoleActions = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'console' });
  const [autoScroll, setAutoScroll] = useReplayStore(
    useShallow((state) => [state.autoScroll, state.setAutoScroll]),
  );

  return (
    <Tooltip title={!autoScroll ? t('auto-scroll-on') : t('auto-scroll-off')}>
      <Button
        onClick={() => {
          setAutoScroll(!autoScroll);
        }}
        size="small"
      >
        {!autoScroll ? <CaretRightOutlined /> : <PauseOutlined />}
      </Button>
    </Tooltip>
  );
};

export const ConsolePanel = memo(() => {
  const [consoleMsg, autoScroll, setAutoScroll] = useReplayStore(
    useShallow((state) => [
      state.consoleMsg,
      state.autoScroll,
      state.setAutoScroll,
    ]),
  );
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoScroll) return;

    const parent = panelRef.current?.parentElement;
    if (!parent) return;

    parent.scrollTo({
      top: parent.scrollHeight,
    });
  }, [consoleMsg, autoScroll]);

  useEffect(() => {
    const parent = panelRef.current?.parentElement;
    if (!parent) return;

    let scrollY = 0;
    const fn = () => {
      const value = parent.scrollTop;
      if (value < scrollY) {
        setAutoScroll(false);
      } else {
        setAutoScroll(true);
      }
      scrollY = value;
    };
    parent.addEventListener('scroll', fn);
    return () => {
      parent.removeEventListener('scroll', fn);
    };
  }, [setAutoScroll]);

  return (
    <div className="console-panel" ref={panelRef}>
      <ConfigProvider offline>
        {consoleMsg.map((data) => (
          <ConsoleItem data={data} key={data.id} />
        ))}
      </ConfigProvider>
    </div>
  );
});
