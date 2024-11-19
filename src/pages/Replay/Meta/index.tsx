import { MetaInfo, useReplayStore } from '@/store/replay';
import { parseUserAgent } from '@/utils/brand';
import { Button, Flex, Popover, Space, Tooltip } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import './index.less';
import CopyContent from '@/components/CopyContent';

const renderOrder = ['ua', 'title', 'url', 'remark'] as const;

type RenderProps<T = keyof MetaInfo> = T extends keyof MetaInfo
  ? {
      name: T;
      value: MetaInfo[T];
    }
  : never;

const MetaRender = ({ name, value }: RenderProps) => {
  if (name === 'ua') {
    const { os, browser } = parseUserAgent(value);
    return (
      <Space>
        <Tooltip title={`${os.name} ${os.version}`}>
          <img src={os.logo} alt="os logo" />
        </Tooltip>

        <Tooltip title={`${browser.name} ${browser.version}`}>
          <img src={browser.logo} alt="browser logo" />
        </Tooltip>
      </Space>
    );
  }
  if (name === 'title') {
    return <span>{value || '--'}</span>;
  }
  if (name === 'url') {
    return <CopyContent content={value || ''} />;
  }
  if (name === 'remark') {
    return <span>{value || '--'}</span>;
  }
  return null;
};

export const Meta = memo(() => {
  const [metaMsg] = useReplayStore(useShallow((state) => [state.metaMsg]));
  const { t } = useTranslation();

  const metaContent = useMemo(() => {
    if (!metaMsg) return null;
    return (
      <div>
        {renderOrder.map((key) => {
          if (!Object.hasOwn(metaMsg, key)) return null;

          return (
            <div className="meta-item" key={key}>
              <b>{t(`replay.meta.${key}`)}</b>
              <MetaRender name={key} value={metaMsg[key]} />
            </div>
          );
        })}
      </div>
    );
  }, [metaMsg, t]);

  if (!metaMsg) return null;

  return (
    <Popover content={metaContent} trigger="click" placement="bottomLeft">
      <Button>{t('replay.meta-info')}</Button>
    </Popover>
  );
});
