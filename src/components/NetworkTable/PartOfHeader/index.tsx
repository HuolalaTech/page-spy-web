import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';

export const PartOfHeader = () => (
  <Tooltip title="CAUTION: just part of headers are shown.">
    <InfoCircleFilled style={{ color: '#E9994B' }} />
  </Tooltip>
);
