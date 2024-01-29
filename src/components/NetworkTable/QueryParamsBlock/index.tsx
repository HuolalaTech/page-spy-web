import { Space } from 'antd';
import { useState, useMemo } from 'react';
import { EntriesBody } from '../EntriesBody';

export const QueryParamsBlock: React.FC<{ data: [string, string][] }> = ({
  data,
}) => {
  const [decoded, setDecoded] = useState(true);
  const decodedData = useMemo(() => {
    if (!decoded) {
      return data.reduce((acc, [key, value]) => {
        acc.push([key, encodeURIComponent(value)]);
        return acc;
      }, [] as [string, string][]);
    }
    return data;
  }, [data, decoded]);

  const toggleText = useMemo(() => {
    return decoded ? 'view URL-encoded' : 'view decoded';
  }, [decoded]);

  return (
    <div className="detail-block">
      <Space className="detail-block__label">
        <span>Query String Parameters</span>
        <span
          onClick={() => setDecoded(!decoded)}
          style={{ fontWeight: 'normal', cursor: 'pointer' }}
        >
          {toggleText}
        </span>
      </Space>
      <div className="detail-block__content">
        <EntriesBody data={decodedData} />
      </div>
    </div>
  );
};
