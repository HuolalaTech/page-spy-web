import { SpyConsole } from '@huolala-tech/page-spy';
import { ReactComponent as ErrorStackSvg } from '@/assets/image/error-stack.svg';
import './index.less';
import Icon from '@ant-design/icons';
import { useCallback } from 'react';
import ErrorStackParser from 'error-stack-parser';

export type RequiredFrames = Required<StackFrame>[];

export const isErrorTraceNode = (
  item: SpyConsole.DataItem,
): item is RRequired<SpyConsole.DataItem> => {
  if (
    item.logType === 'error' &&
    item.logs.length === 1 &&
    item.errorDetail &&
    item.errorDetail.stack
  ) {
    return true;
  }
  return false;
};

export const ErrorTraceNode = ({
  data,
}: {
  data: RRequired<SpyConsole.DataItem>;
}) => {
  const onPopupDetail = useCallback(() => {
    if (!data.errorDetail.stack) {
      return;
    }

    const err = new Error();

    const { name, message, stack } = data.errorDetail;
    err.name = name;
    err.message = message;
    err.stack = stack;
    const frames = ErrorStackParser.parse(err).filter(
      ({ fileName, lineNumber, columnNumber }) => {
        return [fileName, lineNumber, columnNumber].every(Boolean);
      },
    ) as RequiredFrames;
    if (!frames.length) return;

    window.dispatchEvent(
      new CustomEvent('source-code-detail', {
        detail: {
          frames,
        },
      }),
    );
  }, [data.errorDetail]);

  return (
    <div className="error-trace">
      <Icon
        component={ErrorStackSvg}
        className="error-trace-icon"
        onClick={onPopupDetail}
      />
      <div className="error-trace-node">
        <code>{data.errorDetail.stack}</code>
      </div>
    </div>
  );
};
