import { Button, Flex, Upload } from 'antd';
import { useStepStore } from '../store';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LinkSvg from '@/assets/image/link.svg?react';
import Icon, { FileSearchOutlined } from '@ant-design/icons';
import demo from './demo.json?url';

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
      <h5 style={{ textAlign: 'center', letterSpacing: 0.5 }}>
        <Trans i18nKey="lab.welcome-desc">
          几行代码，让系统拥有强大的「问题反馈」能力
          <br />
          数据都在本地，不经过网络传输，无需担心隐私泄露
        </Trans>
      </h5>
      <Flex gap={12} align="center">
        <Button
          type="primary"
          size="large"
          onClick={() => {
            gotoReplay(demo);
          }}
        >
          <b>体验 Demo</b>
        </Button>

        <Upload
          accept=".json"
          maxCount={1}
          customRequest={(file) => {
            const blob = URL.createObjectURL(file.file as File);
            gotoReplay(blob);
          }}
          itemRender={() => null}
        >
          <Button size="large">
            <b>{t('lab.select-log')}</b>
          </Button>
        </Upload>
        <Link
          to="/docs"
          style={{
            color: 'white',
            textDecoration: 'underline',
            textUnderlineOffset: 4,
          }}
        >
          <Flex gap={4}>
            <span>接入文档</span>
            <Icon component={LinkSvg} />
          </Flex>
        </Link>
      </Flex>
    </Flex>
  );
};
