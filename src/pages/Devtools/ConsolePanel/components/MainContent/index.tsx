import { useSocketMessageStore } from '@/store/socket-message';
import { DoubleRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import {
  UIEventHandler,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useMiscStore } from '@/store/misc';
import { useForceThrottleRender } from '@/utils/useForceRender';
import { ConsoleItem } from '@/components/ConsoleItem';

export const MainContent = memo(() => {
  const { t } = useTranslation('translation', { keyPrefix: 'console' });

  const containerEl = useRef<HTMLDivElement | null>(null);
  const currentScrollTop = useRef<number>(0);
  const messageLength = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    const container = containerEl.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight - container.offsetHeight,
      behavior: 'smooth',
    });
  }, []);

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

  const [isAutoScroll, setIsAutoScroll] = useMiscStore((state) => [
    state.isAutoScroll,
    state.setIsAutoScroll,
  ]);
  const [newTips, setNewTips] = useState<boolean>(false);
  useEffect(() => {
    const data = consoleMessages.current;
    const logType = [...data].pop()?.logType || '';
    const isDebug = ['debug-origin', 'debug-eval'].includes(logType);
    const evalError =
      data.length > 1 && data[data.length - 2].logType === 'debug-origin';
    if (isDebug || evalError || isAutoScroll) {
      scrollToBottom();
    } else {
      const container = containerEl.current;
      if (!container) return;

      const { offsetHeight, scrollHeight } = container;
      if (
        scrollHeight > offsetHeight &&
        messageLength.current !== data.length
      ) {
        setNewTips(true);
      }
    }
  }, [isUpdated, scrollToBottom, isAutoScroll]);

  useEffect(() => {
    const container = containerEl.current;
    if (!container) return;

    const fn = () => {
      const { offsetHeight, scrollTop, scrollHeight } = container;
      if (scrollHeight > offsetHeight) {
        if (scrollTop + offsetHeight > scrollHeight - 30) {
          setNewTips(false);
        }
      }
    };

    container.addEventListener('scrollend', fn);
    return () => {
      container.removeEventListener('scrollend', fn);
    };
  }, []);

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const direction =
        e.currentTarget.scrollTop > currentScrollTop.current ? 'down' : 'up';
      currentScrollTop.current = e.currentTarget.scrollTop;

      if (direction === 'up' && isAutoScroll) {
        setIsAutoScroll(false);
        return;
      }

      const isBottom =
        Math.ceil(e.currentTarget.scrollTop) ===
        e.currentTarget.scrollHeight - e.currentTarget.offsetHeight;
      if (isBottom) {
        messageLength.current = document.querySelectorAll(
          '.console-list .console-item',
        ).length;
        // TODO
        // setIsAutoScroll(true);
      }
    },
    [setIsAutoScroll, isAutoScroll],
  );

  const consoleDataList = useMemo(() => {
    const data = consoleMessages.current;
    const logLevels = consoleFilter.current;
    const keyword = consoleKeywordFilter.current;
    return data.filter((item) => {
      return (
        (!logLevels.length || logLevels.includes(item.logType)) &&
        item.logs
          .map((item) => item.value)
          .join('')
          .indexOf(keyword) !== -1
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdated]);

  return (
    <div className="console-list" ref={containerEl} onScroll={handleScroll}>
      {consoleDataList.map((item) => (
        <ConsoleItem data={item} key={item.id} />
      ))}
      {newTips && (
        <div className="console-list__new" onClick={scrollToBottom}>
          <Button shape="round" type="primary">
            <DoubleRightOutlined rotate={90} />
            <span>{t('newContent')}</span>
          </Button>
        </div>
      )}
    </div>
  );
});
