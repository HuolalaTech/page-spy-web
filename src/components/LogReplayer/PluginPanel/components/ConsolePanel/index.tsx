import { ConsoleList } from '@/components/ConsoleList';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { DebugConfigProvider } from '@/components/DebugConfigProvider';
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

  const currentScrollTop = useRef<number>(0);
  useEffect(() => {
    const parent = panelRef.current?.parentElement;
    if (!parent) return;

    const handleScroll = () => {
      const direction =
        parent.scrollTop > currentScrollTop.current ? 'down' : 'up';
      currentScrollTop.current = parent.scrollTop;

      if (direction === 'up') {
        setAutoScroll(false);
        return;
      }
    };
    parent.addEventListener('scroll', handleScroll);
    return () => {
      parent.removeEventListener('scroll', handleScroll);
    };
  }, [setAutoScroll]);

  return (
    <div className="console-panel" ref={panelRef}>
      <DebugConfigProvider offline>
        <ConsoleList data={consoleMsg} />
      </DebugConfigProvider>
    </div>
  );
});
