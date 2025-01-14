import { ResolvedNetworkInfo } from '@/utils';
import { Space } from 'antd';
import clsx from 'clsx';

export const StatusCode = ({ data }: { data: ResolvedNetworkInfo }) => {
  const { readyState, status } = data;
  let statusClass = '';
  let statusText = status;
  const code = Number(status);
  if (code < 200) {
    if (readyState <= 1) {
      statusClass = 'pending';
      statusText = 'Pending';
    } else {
      statusClass = 'error';
      statusText = 'Failed';
    }
  } else if (code < 300) {
    statusClass = 'success';
  } else if (code < 400) {
    statusClass = 'redirect';
  } else {
    statusClass = 'error';
  }
  return (
    <Space>
      <div className={clsx(['status-code-circle', statusClass])} />
      <b>{statusText}</b>
    </Space>
  );
};
