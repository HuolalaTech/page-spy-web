import Icon from '@ant-design/icons';
import { ReactComponent as ErrorStackSvg } from '@/assets/image/error-stack.svg';
import type { StackFrame } from 'error-stack-parser';
import { useCallback, useMemo } from 'react';
import ErrorStackParser from 'error-stack-parser';
import { SpyConsole } from '@huolala-tech/page-spy';
import { usePopupRef } from '@/utils/withPopup';
import { RequiredFrames, StackDetailDrawer } from './StackDetailDrawer';

export const StackDetail = ({
  data,
}: {
  data: SpyConsole.DataItem['errorDetail'];
}) => {
  const stackFrames = useMemo(() => {
    if (!data?.stack) return [];
    const err = new Error();

    const { name, message, stack } = data;
    err.name = name;
    err.message = message;
    err.stack = stack;
    return ErrorStackParser.parse(err).filter(
      ({ fileName, lineNumber, columnNumber }) => {
        return [fileName, lineNumber, columnNumber].every(Boolean);
      },
    ) as RequiredFrames;
  }, [data]);

  const detailDrawerRef = usePopupRef<RequiredFrames, void>();
  const onOpenDetail = useCallback(() => {
    detailDrawerRef.current?.popup(stackFrames);
  }, [detailDrawerRef, stackFrames]);

  if (!data) return null;

  return (
    <>
      <Icon
        component={ErrorStackSvg}
        className="error-trace-icon"
        onClick={onOpenDetail}
      />
      <StackDetailDrawer ref={detailDrawerRef} />
    </>
  );
};
