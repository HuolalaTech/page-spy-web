import ReactJsonView from '@huolala-tech/react-json-view';
import { isString } from 'lodash-es';
import { useMemo } from 'react';
import { EntriesBody } from '@/components/EntriesBody';

export const RequestPayloadBlock: React.FC<{
  data: string | [string, string][];
  urlencoded?: boolean;
}> = ({ data, urlencoded = false }) => {
  const content = useMemo(() => {
    if (isString(data)) {
      if (urlencoded) {
        const params = new URLSearchParams(data);
        return <EntriesBody data={[...params]} />;
      }
      return <ReactJsonView source={data} defaultExpand />;
    }
    return <EntriesBody data={data} />;
  }, [data, urlencoded]);
  return (
    <div className="detail-block">
      <b className="detail-block__label">Request Payload</b>
      <div className="detail-block__content">{content}</div>
    </div>
  );
};
