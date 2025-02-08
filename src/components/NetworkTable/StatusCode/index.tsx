import { ResolvedNetworkInfo } from '@/utils';
import { Space } from 'antd';
import clsx from 'clsx';
import { getStatusInfo } from '../utils';

export const StatusCode = ({ data }: { data: ResolvedNetworkInfo }) => {
  const { status, text } = getStatusInfo(data);
  return (
    <Space>
      <div className={clsx(['status-code-circle', status])} />
      <span>{text}</span>
    </Space>
  );
};
