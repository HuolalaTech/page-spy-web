import { ConsoleList } from '@/components/ConsoleList';
import { useReplayStore } from '@/store/replay';
import './index.less';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { DebugConfigProvider } from '@/components/DebugConfigProvider';
import { useTranslation } from 'react-i18next';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { Tooltip, Button } from 'antd';
import { ListOnScrollProps, VariableSizeList } from 'react-window';

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

  const consoleListRef = useRef<VariableSizeList>(null);
  useEffect(() => {
    if (autoScroll) {
      consoleListRef.current?.scrollToItem(consoleMsg.length - 1, 'end');
    }
  }, [autoScroll, consoleMsg.length]);

  const handleScroll = useCallback(
    ({ scrollDirection }: ListOnScrollProps) => {
      if (scrollDirection === 'backward' && autoScroll) {
        setAutoScroll(false);
      }
    },
    [autoScroll, setAutoScroll],
  );

  return (
    <div className="replay-console-panel">
      <DebugConfigProvider offline>
        <ConsoleList
          data={consoleMsg}
          onScroll={handleScroll}
          ref={consoleListRef}
        />
      </DebugConfigProvider>
    </div>
  );
});
