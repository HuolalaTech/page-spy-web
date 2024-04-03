import React, { CSSProperties } from 'react';
import './index.less';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

type Props = {
  inline?: boolean;
  style?: CSSProperties;
  className?: string;
};

const MPWarning = (props: Props) => {
  const { t } = useTranslation('translation', { keyPrefix: 'devtool' });

  return (
    <div
      className={`mp-warning ${props.inline ? 'mp-warning-inline' : ''} ${
        props.className || ''
      }`}
      style={{ ...props.style }}
    >
      <ExclamationCircleFilled />
      <div>{t('mp-warning')}</div>
    </div>
  );
};

export default MPWarning;
