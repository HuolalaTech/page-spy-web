import { SpyConsole } from '@huolala-tech/page-spy-types';
import { ReactComponent as ErrorStackSvg } from '@/assets/image/error-stack.svg';
import './index.less';
import Icon from '@ant-design/icons';
import { useCallback } from 'react';
import ErrorStackParser from 'error-stack-parser';
import { useTranslation } from 'react-i18next';

export type RequiredFrames = Required<StackFrame>[];

// Caught exceptions, e.g. throw new Error()
export const getStackFramesIfErrorTrace = (item: SpyConsole.DataItem) => {
  if (item.logType === 'error' && item.errorDetail && item.errorDetail.stack) {
    const error = new Error();

    const { name, message, stack } = item.errorDetail;
    error.name = name;
    error.message = message;
    error.stack = stack;
    const frames = ErrorStackParser.parse(error).filter(
      ({ fileName, lineNumber, columnNumber }) => {
        return [fileName, lineNumber, columnNumber].every(Boolean);
      },
    ) as RequiredFrames;
    if (frames.length)
      return {
        error,
        frames,
      };
  }
  return false;
};

// console.error('Hello', new Error())
//                        ⬆
export const getStackFramesIfErrorConsole = (
  log: SpyConsole.DataItem['logs'][number],
) => {
  if (log.type === 'error') {
    const error = new Error();
    error.stack = log.value;
    const frames = ErrorStackParser.parse(error).filter(
      ({ fileName, lineNumber, columnNumber }) => {
        return [fileName, lineNumber, columnNumber].every(Boolean);
      },
    ) as RequiredFrames;
    if (frames.length)
      return {
        error,
        frames,
      };
  }
  return false;
};

interface Props {
  data: { error: Error; frames: RequiredFrames };
}
export const ErrorTraceNode = ({ data }: Props) => {
  const { t } = useTranslation('translation', { keyPrefix: 'error' });

  const onPopupDetail = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('source-code-detail', {
        detail: data,
      }),
    );
  }, [data]);

  return (
    <div className="error-trace">
      <Icon
        component={ErrorStackSvg}
        className="error-trace-icon"
        onClick={onPopupDetail}
      />
      <div className="error-trace-node">
        <code>{data.error.stack}</code>
      </div>
    </div>
  );
};
