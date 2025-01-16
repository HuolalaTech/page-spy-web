import {
  CaretRightOutlined,
  PauseOutlined,
  RightOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { Input, Button, Tooltip } from 'antd';
import { Shortcuts } from '../Shortcuts';
import { useSocketMessageStore } from '@/store/socket-message';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { KeyboardEvent } from 'react';
import { useMiscStore } from '@/store/misc';
import { parse, Program } from 'acorn';

const EXECUTE_HISTORY_ID = 'page_spy_execute_history';
const EXECUTE_HISTORY_MAX_SIZE = 100;

export const FooterInput = memo(() => {
  const { t } = useTranslation('translation', { keyPrefix: 'console' });
  const [socket, clearRecord, clientInfo] = useSocketMessageStore((state) => [
    state.socket,
    state.clearRecord,
    state.clientInfo,
  ]);

  const inputRef = useRef<TextAreaRef | null>(null);
  const [code, setCode] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const executeHistory = useRef<string[]>(
    JSON.parse(localStorage.getItem(EXECUTE_HISTORY_ID) || '[]'),
  );
  const [isAutoScroll, setIsAutoScroll] = useMiscStore((state) => [
    state.isAutoScroll,
    state.setIsAutoScroll,
  ]);
  const [showInputError, setShowInputError] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();

    const storage = executeHistory.current;
    setCurrentIndex(storage.length);
    return () => {
      const size = storage.length;
      const diff = size - EXECUTE_HISTORY_MAX_SIZE;
      if (diff > 0) {
        const sliceData = storage.slice(diff);
        localStorage.setItem(EXECUTE_HISTORY_ID, JSON.stringify(sliceData));
      }
    };
  }, []);

  const handleDebugCode = useCallback(() => {
    const trimedCode = code.trim();
    if (trimedCode) {
      const browserType = clientInfo?.browser.type;
      if (browserType?.startsWith('mp-') || browserType === 'uni-native') {
        let nodes = {} as Program;
        try {
          nodes = parse(trimedCode, {
            ecmaVersion: 5,
            ranges: true,
            locations: true,
          });
        } catch (e) {
          setShowInputError(true);
          setTimeout(() => {
            setShowInputError(false);
          }, 5000);
          return;
        }
        socket?.unicastMessage({
          type: 'debug',
          data: {
            code: trimedCode,
            nodes,
          },
        });
      } else {
        socket?.unicastMessage({
          type: 'debug',
          data: trimedCode,
        });
      }

      setCode('');
      const historyStorage = executeHistory.current;
      if (trimedCode === historyStorage[historyStorage.length - 1]) return;
      historyStorage.push(trimedCode);
      setCurrentIndex(historyStorage.length);
      localStorage.setItem(EXECUTE_HISTORY_ID, JSON.stringify(historyStorage));
    }
  }, [code, socket]);

  const clear = useCallback(() => {
    clearRecord('console');
  }, [clearRecord]);

  const onTextareaKeyDown = useCallback(
    // eslint-disable-next-line complexity
    (evt: KeyboardEvent<HTMLTextAreaElement>) => {
      evt.stopPropagation();
      const { key, keyCode, shiftKey, metaKey, ctrlKey, target: ta } = evt;
      const { selectionStart, selectionEnd } = ta as HTMLTextAreaElement;

      // Enter
      const isEnter = key === 'Enter' || keyCode === 13;
      if (isEnter) {
        evt.preventDefault();
        if (shiftKey) {
          const before = code.slice(0, selectionStart);
          const rest = code.slice(selectionStart);
          setCode(`${before}\n${rest}`);
          setTimeout(() => {
            (ta as HTMLTextAreaElement).selectionStart = before.length + 1;
            (ta as HTMLTextAreaElement).selectionEnd = before.length + 1;
          });
        } else {
          if (code.trim() === 'clear()') {
            setCode('');
            clear();
            return;
          }
          handleDebugCode();
        }
        return;
      }

      // clear function
      const isK = key === 'k' || keyCode === 75;
      const isL = key === 'l' || keyCode === 76;
      if ((isK && metaKey) || (isL && ctrlKey)) {
        evt.preventDefault();
        setCode('');
        clear();
        return;
      }

      // Tab
      const isTab = key === 'Tab' || keyCode === 9;
      if (isTab) {
        evt.preventDefault();
        const before = `${code.slice(0, selectionStart)}  `;
        const rest = code.slice(selectionStart);
        setCode(`${before}${rest}`);
        setTimeout(() => {
          (ta as HTMLTextAreaElement).selectionStart = before.length;
          (ta as HTMLTextAreaElement).selectionEnd = before.length;
        });
      }

      //  Up or Down
      if (selectionStart !== selectionEnd) return;

      const isUp = key === 'ArrowUp' || keyCode === 38;
      const isDown = key === 'ArrowDown' || keyCode === 40;
      if (!isUp && !isDown) return;

      const codeSlice = code.split('\n');
      let index = null;
      let boundary = null;
      const hasHistory = executeHistory.current.length > 0;
      if (isUp) {
        const firstLine = codeSlice[0] || '';
        boundary = firstLine.length;
        if (selectionStart <= boundary && hasHistory) {
          if (currentIndex === 0) return;
          index = currentIndex - 1;
        }
      } else {
        const lastLine = [...codeSlice].pop() || '';
        boundary = code.length - lastLine.length - codeSlice.length + 1;
        if (selectionStart >= boundary && hasHistory) {
          if (currentIndex === executeHistory.current.length - 1) return;
          index = currentIndex + 1;
        }
      }
      if (index !== null) {
        const codeData = executeHistory.current[index!];
        setCode(codeData);
        setCurrentIndex(index!);
        setTimeout(() => {
          (ta as HTMLTextAreaElement).selectionStart = codeData.length;
          (ta as HTMLTextAreaElement).selectionEnd = codeData.length;
        });
      }
    },
    [clear, code, currentIndex, handleDebugCode],
  );

  return (
    <div className="console-item page-spy-input">
      <RightOutlined className="icon" />
      <Tooltip
        open={showInputError}
        title={
          <span>
            <ExclamationCircleFilled
              style={{ color: '#f5222d', marginRight: 6 }}
            />
            {t('mp-code-error')}
          </span>
        }
      >
        <code style={{ flex: 1 }}>
          <Input.TextArea
            spellCheck="false"
            placeholder={t('placeholder')!}
            variant="borderless"
            autoSize
            ref={inputRef}
            value={code}
            onChange={(evt) => setCode(evt.target.value)}
            className="mono-code"
            onKeyDown={onTextareaKeyDown}
          />
        </code>
      </Tooltip>
      <Button
        type="primary"
        size="small"
        style={{ marginTop: 4, marginRight: 8 }}
        onClick={handleDebugCode}
      >
        {t('run')}
      </Button>
      <Tooltip
        title={!isAutoScroll ? t('auto-scroll-on') : t('auto-scroll-off')}
      >
        <Button
          onClick={() => {
            setIsAutoScroll(!isAutoScroll);
          }}
          size="small"
          style={{ marginTop: 4 }}
        >
          {!isAutoScroll ? <CaretRightOutlined /> : <PauseOutlined />}
        </Button>
      </Tooltip>
      <Shortcuts />
    </div>
  );
});
