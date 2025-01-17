import { Button, Flex } from 'antd';
import { useStepStore } from './store';
import { Trans, useTranslation } from 'react-i18next';

export const Welcome = () => {
  const { t } = useTranslation();
  const next = useStepStore((state) => state.next);

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
      <Button size="large" onClick={next}>
        <b>{t('lab.take-try')}</b>
      </Button>
    </Flex>
  );
};
