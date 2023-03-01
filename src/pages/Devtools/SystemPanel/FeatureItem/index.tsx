import React, { useMemo } from 'react';
import { ReactComponent as SupportSvg } from '@/assets/image/support.svg';
import { ReactComponent as NoSupportSvg } from '@/assets/image/no-support.svg';
import Icon from '@ant-design/icons';
import './index.less';
import { Tooltip } from 'antd';
import type { SpySystem } from '@huolala-tech/page-spy';

export const FeatureItem: React.FC<SpySystem.FeatureDescriptor> = ({
  title,
  supported,
  keyPath = '',
  customTest = '',
}) => {
  const icon = supported ? SupportSvg : NoSupportSvg;
  const TitleOverlay = useMemo(() => {
    if (keyPath) {
      return (
        <a href={keyPath} target="_blank">
          See detection rule
        </a>
      );
    }
    return <code style={{ color: '#333' }}>{customTest}</code>;
  }, [keyPath, customTest]);
  return (
    <Tooltip title={TitleOverlay} color="#fff" placement="topLeft">
      <div className="feature-item">
        <div className="feature-item__label">{title}</div>
        <div className="feature-item__value">
          <Icon component={icon} style={{ fontSize: 14, fontWeight: 700 }} />
        </div>
      </div>
    </Tooltip>
  );
};
