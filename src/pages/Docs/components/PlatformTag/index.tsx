import { Tag } from 'antd';
import { t } from 'i18next';
import React from 'react';

type Props = {
  type: PlatformType;
};

type PlatformType = 'browser' | 'mp' | 'rn' | 'harmony';
const PlatformMap: Record<
  PlatformType,
  {
    color: string;
    label: string;
  }
> = {
  browser: {
    color: '#409EFF',
    label: t('common.browser'),
  },
  mp: {
    color: '#67C23A',
    label: t('common.miniprogram'),
  },
  rn: {
    color: '#61dafb',
    label: 'RN',
  },
  harmony: {
    color: '#000',
    label: t('common.harmony'),
  },
};

const PlatformTag = (props: Props) => {
  const platform = PlatformMap[props.type];
  return <Tag color={platform.color}>{platform.label}</Tag>;
};

export default PlatformTag;
