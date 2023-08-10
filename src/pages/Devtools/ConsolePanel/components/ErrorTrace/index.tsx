import { SpyConsole } from '@huolala-tech/page-spy';
import { StackDetail } from './components/StackDetail';
import './index.less';

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
  return (
    <div className="error-trace">
      <StackDetail data={data.errorDetail} />
      <div className="error-trace-node">
        <code>{data.errorDetail.stack}</code>
      </div>
    </div>
  );
};
