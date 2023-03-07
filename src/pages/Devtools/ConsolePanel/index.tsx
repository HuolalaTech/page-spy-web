/* eslint-disable no-underscore-dangle */
import {
  RightOutlined,
  ClearOutlined,
  DoubleRightOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useWSInfo } from '../WSInfo';
import LogType from './components/LogType';
import ConsoleNode from './components/ConsoleNode';
import './index.less';
import type { TextAreaRef } from 'antd/lib/input/TextArea';
import { Shortcuts } from './components/Shortcuts';
import { useTranslation } from 'react-i18next';

const EXECUTE_HISTORY_ID = 'page_spy_execute_history';
const EXECUTE_HISTORY_MAX_SIZE = 100;

const ConsolePanel = () => {
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
  const { t } = useTranslation('translation', { keyPrefix: 'console' });
  const { socket, consoleMsg: data, clearRecord } = useWSInfo();
  const inputRef = useRef<TextAreaRef | null>(null);
  const [code, setCode] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [newTips, setNewTips] = useState<boolean>(false);
  const executeHistory = useRef<string[]>(
    JSON.parse(localStorage.getItem(EXECUTE_HISTORY_ID) || '[]'),
  );

  const clear = useCallback(() => {
    clearRecord('console');
    if (newTips) {
      setNewTips(false);
    }
  }, [clearRecord, newTips]);

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
      socket?.unicastMessage({
        type: 'debug',
        data: trimedCode,
      });
      setCode('');
      const historyStorage = executeHistory.current;
      if (trimedCode === historyStorage[historyStorage.length - 1]) return;
      historyStorage.push(trimedCode);
      setCurrentIndex(historyStorage.length);
      localStorage.setItem(EXECUTE_HISTORY_ID, JSON.stringify(historyStorage));
    }
  }, [code, socket]);

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

  const scrollToBottom = useCallback(() => {
    const container = document.querySelector(
      '.page-spy-devtools .console-list',
    ) as HTMLDivElement;
    container.scrollTo({
      top: container.scrollHeight - container.offsetHeight,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const container = document.querySelector(
      '.page-spy-devtools .console-list',
    ) as HTMLDivElement;
    function onScroll() {
      const { scrollTop, offsetHeight, scrollHeight } = container;
      if (scrollTop + offsetHeight >= scrollHeight - 20) {
        setNewTips(false);
      }
    }
    container.addEventListener('scroll', onScroll, false);
    return () => {
      container.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const logType = [...data].pop()?.logType || '';
    const isEval = logType === 'debug-eval';
    const evalError =
      data.length > 1 && data[data.length - 2].logType === 'debug-origin';
    if (isEval || evalError) {
      scrollToBottom();
    } else {
      const container = document.querySelector(
        '.page-spy-devtools .console-list',
      ) as HTMLDivElement;
      const { offsetHeight, scrollTop, scrollHeight } = container;
      if (scrollHeight > offsetHeight) {
        if (scrollTop + offsetHeight <= scrollHeight - 30) {
          setNewTips(true);
        }
      }
    }
  }, [data, scrollToBottom]);

  return (
    <div className="console-panel">
      <Row justify="end">
        <Col>
          <Tooltip title={ct('clear')}>
            <Button onClick={clear}>
              <ClearOutlined />
            </Button>
          </Tooltip>
        </Col>
      </Row>
      <div className="console-panel__content">
        <div className="console-list">
          {data.map((item) => (
            <div className={`console-item ${item.logType}`} key={item.id}>
              <div className="console-item__title">
                <LogType type={item.logType} />
              </div>
              <div className="console-item__content">
                {item.logs?.map((log) => {
                  return <ConsoleNode data={log} key={log.id} />;
                })}
              </div>
              <div className="console-item__url" title={item.url}>
                {item.url?.substring(new URL(item.url).origin.length)}
              </div>
            </div>
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
        <div className="console-item page-spy-input">
          <RightOutlined className="icon" />
          <code style={{ flex: 1 }}>
            <Input.TextArea
              ref={inputRef}
              placeholder={t('placeholder')!}
              bordered={false}
              autoSize
              value={code}
              onChange={(evt) => setCode(evt.target.value)}
              onKeyDown={onTextareaKeyDown}
            />
          </code>
          <Button
            type="primary"
            size="small"
            style={{ marginTop: 4 }}
            onClick={handleDebugCode}
          >
            {t('run')}
          </Button>
          <Shortcuts />
        </div>
      </div>
    </div>
  );
};

export default ConsolePanel;
