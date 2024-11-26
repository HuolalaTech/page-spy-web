import { Tag } from 'antd';
import { t } from 'i18next';
import React from 'react';

interface Props {
  type: PlatformType;
}

type PlatformType = 'browser' | 'mp' | 'rn' | 'harmony';
const PlatformMap: Record<
  PlatformType,
  {
    color: string;
    label: string;
  }
> = {
  browser: {
    color: '#E54D21',
    label: t('common.browser'),
  },
  mp: {
    color: '#67C23A',
    label: t('common.miniprogram'),
  },
  rn: {
    color: '#58C4DC',
    label: t('common.rn'),
  },
  harmony: {
    color: '#444444',
    label: t('common.harmony'),
  },
};

const PlatformTag = (props: Props) => {
  const platform = PlatformMap[props.type];
  return (
    <Tag color={platform.color}>
      <b>{platform.label}</b>
    </Tag>
  );
};

export default PlatformTag;
