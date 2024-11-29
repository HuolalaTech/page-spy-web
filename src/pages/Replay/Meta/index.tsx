import { MetaInfo, useReplayStore } from '@/store/replay';
import { parseUserAgent } from '@/utils/brand';
import {
  Button,
  ConfigProvider,
  Divider,
  Flex,
  Popover,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import './index.less';
import CopyContent from '@/components/CopyContent';

const { Paragraph, Title } = Typography;

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
      <Flex vertical>
        <Space>
          <Tooltip title={`${os.name} ${os.version}`}>
            <img src={os.logo} alt="os logo" className="meta-brand-logo" />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title={`${browser.name} ${browser.version}`}>
            <img
              src={browser.logo}
              alt="browser logo"
              className="meta-brand-logo"
            />
          </Tooltip>
        </Space>
        <Paragraph ellipsis={{ rows: 3, expandable: true }}>
          {value || '--'}
        </Paragraph>
      </Flex>
    );
  }
  if (name === 'title') {
    return <Paragraph>{value || '--'}</Paragraph>;
  }
  if (name === 'url') {
    return (
      <Paragraph copyable ellipsis={{ rows: 3 }}>
        {value}
      </Paragraph>
    );
  }
  if (name === 'remark') {
    return (
      <Paragraph ellipsis={{ rows: 3, expandable: true }}>
        {value || '--'}
      </Paragraph>
    );
  }
  return null;
};

export const Meta = memo(() => {
  const [metaMsg] = useReplayStore(useShallow((state) => [state.metaMsg]));
  const { t } = useTranslation();

  const metaContent = useMemo(() => {
    if (!metaMsg) return null;
    return (
      <ConfigProvider
        theme={{
          components: {
            Typography: {
              titleMarginBottom: 6,
            },
          },
        }}
      >
        {renderOrder.map((key) => {
          if (!Object.hasOwn(metaMsg, key)) return null;

          return (
            <div className="meta-item" key={key}>
              <Title level={5}>{t(`replay.meta.${key}`)}</Title>
              <MetaRender name={key} value={metaMsg[key]} />
            </div>
          );
        })}
      </ConfigProvider>
    );
  }, [metaMsg, t]);

  if (!metaMsg) return null;

  return (
    <Popover
      content={metaContent}
      trigger="click"
      placement="bottom"
      getPopupContainer={(node) => node.parentElement!}
    >
      <Button>{t('replay.meta-info')}</Button>
    </Popover>
  );
});
