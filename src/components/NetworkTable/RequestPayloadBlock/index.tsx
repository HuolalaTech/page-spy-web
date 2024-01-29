import ReactJsonView from '@huolala-tech/react-json-view';
import { isString } from 'lodash-es';
import { useMemo } from 'react';
import { EntriesBody } from '../EntriesBody';

export const RequestPayloadBlock: React.FC<{
  data: string | [string, string][];
}> = ({ data }) => {
  const content = useMemo(() => {
    if (isString(data)) {
      return <ReactJsonView source={data} defaultExpand />;
    }
    return <EntriesBody data={data} />;
  }, [data]);
  return (
    <div className="detail-block">
      <b className="detail-block__label">Request Payload</b>
      <div className="detail-block__content">{content}</div>
    </div>
  );
};
