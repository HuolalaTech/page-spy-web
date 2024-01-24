import React, { useMemo } from 'react';
import { ReactComponent as SupportSvg } from '@/assets/image/support.svg';
import { ReactComponent as UnsupportSvg } from '@/assets/image/unsupport.svg';
import Icon from '@ant-design/icons';
import './index.less';
import { Tooltip } from 'antd';
import type { SpySystem } from '@huolala-tech/page-spy-types';
import { useTranslation } from 'react-i18next';
import CopyContent from '@/components/CopyContent';

export const FeatureItem: React.FC<SpySystem.FeatureDescriptor> = ({
  title,
  supported,
  keyPath = '',
  customTest = '',
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'system' });
  const icon = supported ? SupportSvg : UnsupportSvg;
  const TitleOverlay = useMemo(() => {
    if (keyPath) {
      return (
        <a href={keyPath} target="_blank">
          {t('reference')}
        </a>
      );
    }
    return (
      <code style={{ color: '#333' }}>
        <CopyContent content={customTest} />
      </code>
    );
  }, [keyPath, customTest, t]);
  return (
    <Tooltip title={TitleOverlay} color="#fff" placement="topLeft">
      <div className="feature-item">
        <div className="feature-item__label">{title}</div>
        <div className="feature-item__value">
          <Icon component={icon} style={{ fontSize: 16, fontWeight: 700 }} />
        </div>
      </div>
    </Tooltip>
  );
};
