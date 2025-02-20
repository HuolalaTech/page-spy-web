import { Button, Flex, Popover, Upload } from 'antd';
import { useStepStore } from '../store';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import LinkSvg from '@/assets/image/link.svg?react';
import CodeBlockSvg from '@/assets/image/code-block.svg?react';
import PaperClipSvg from '@/assets/image/paper-clip.svg?react';
import Icon from '@ant-design/icons';
import { ImportGuide } from '../ImportGuide';
import { useEffect } from 'react';
import demo from './demo.json?url';
import { useThreshold } from '@/utils/useThreshold';

export const Welcome = () => {
  const { t } = useTranslation();
  const [next, setReplayUrl] = useStepStore((state) => [
    state.next,
    state.setReplayUrl,
  ]);

  const gotoReplay = (blob: string) => {
    setReplayUrl(blob);
    next();
  };

  const { search } = useLocation();
  useEffect(() => {
    if (search.includes('?demo')) {
      gotoReplay(demo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMobile = useThreshold(414);

  return (
    <Flex
      vertical
      justify="center"
      align="center"
      gap={40}
      style={{ height: '100%' }}
    >
      <h1 style={{ textAlign: 'center' }}>
        <Trans i18nKey="lab.welcome-title">
          欢迎来到
          <br />
          回放实验室
        </Trans>
      </h1>
      <h4 style={{ textAlign: 'center', letterSpacing: 0.5 }}>
        <Trans i18nKey="lab.welcome-desc">
          几行代码，让系统拥有强大的「问题反馈」能力
          <br />
          数据都在本地，不经过网络传输，无需担心隐私泄露
        </Trans>
      </h4>
      <Flex gap={24} vertical={isMobile} justify="center" align="center">
        <Flex gap={24}>
          <Popover
            content={ImportGuide}
            trigger="click"
            overlayInnerStyle={{ maxWidth: 800 }}
          >
            <Button
              type="primary"
              size="large"
              icon={<Icon component={CodeBlockSvg} style={{ fontSize: 20 }} />}
            >
              <b>{t('common.inject-sdk')}</b>
            </Button>
          </Popover>

          <Upload
            accept=".json"
            maxCount={1}
            customRequest={(file) => {
              const blob = URL.createObjectURL(file.file as File);
              gotoReplay(blob);
            }}
            itemRender={() => null}
          >
            <Button
              size="large"
              icon={<Icon component={PaperClipSvg} style={{ fontSize: 20 }} />}
            >
              <b>{t('lab.select-log')}</b>
            </Button>
          </Upload>
        </Flex>
        <Link
          to="?demo"
          target="_blank"
          style={{
            color: 'white',
            textDecoration: 'underline',
            textUnderlineOffset: 4,
          }}
        >
          <Flex gap={4}>
            <span>{t('lab.take-try')}</span>
            <Icon component={LinkSvg} />
          </Flex>
        </Link>
      </Flex>
    </Flex>
  );
};
