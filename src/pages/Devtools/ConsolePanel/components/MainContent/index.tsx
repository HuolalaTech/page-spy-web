import { useSocketMessageStore } from '@/store/socket-message';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useMiscStore } from '@/store/misc';
import { useForceThrottleRender } from '@/utils/useForceRender';
import { ConsoleList } from '@/components/ConsoleList';
import { VariableSizeList, ListOnScrollProps } from 'react-window';
import { useShallow } from 'zustand/react/shallow';

export const MainContent = memo(() => {
  const storeRef = useRef(useSocketMessageStore.getState());
  const consoleMessages = useRef(storeRef.current.consoleMsg);
  const consoleFilter = useRef(storeRef.current.consoleMsgTypeFilter);
  const consoleKeywordFilter = useRef(storeRef.current.consoleMsgKeywordFilter);
  const { isUpdated, throttleRender } = useForceThrottleRender();
  useEffect(
    () =>
      useSocketMessageStore.subscribe((state) => {
        consoleMessages.current = state.consoleMsg;
        consoleFilter.current = state.consoleMsgTypeFilter;
        consoleKeywordFilter.current = state.consoleMsgKeywordFilter;
        throttleRender();
      }),
    [throttleRender],
  );

  const [isAutoScroll, setIsAutoScroll] = useMiscStore(
    useShallow((state) => [state.isAutoScroll, state.setIsAutoScroll]),
  );

  const handleScroll = useCallback(
    ({ scrollDirection }: ListOnScrollProps) => {
      if (scrollDirection === 'backward' && isAutoScroll) {
        setIsAutoScroll(false);
        return;
      }
    },
    [isAutoScroll, setIsAutoScroll],
  );

  const consoleDataList = useMemo(() => {
    const data = consoleMessages.current;
    const logLevels = consoleFilter.current;
    const keyword = consoleKeywordFilter.current;
    if (!logLevels.length && !keyword) return data;

    return data.filter((item) => {
      return (
        logLevels.includes(item.logType) &&
        item.logs
          .map((item) => item.value)
          .join('')
          .indexOf(keyword) !== -1
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdated]);

  const consoleListRef = useRef<VariableSizeList>(null);
  useEffect(() => {
    if (isAutoScroll) {
      consoleListRef.current?.scrollToItem(consoleDataList.length - 1, 'end');
      return;
    }

    const data = consoleMessages.current;
    const logType = data[data.length - 1]?.logType || '';
    const isDebug = ['debug-origin', 'debug-eval'].includes(logType);
    const evalError =
      data.length > 1 && data[data.length - 2].logType === 'debug-origin';
    if (isDebug || evalError) {
      consoleListRef.current?.scrollToItem(data.length - 1, 'end');
    }
  }, [consoleDataList, isAutoScroll]);

  return (
    <div className="main-content">
      <ConsoleList
        data={consoleDataList}
        ref={consoleListRef}
        onScroll={handleScroll}
      />
    </div>
  );
});
