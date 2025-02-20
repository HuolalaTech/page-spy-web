import { LogReplayer } from '@/components/LogReplayer';
import { useMemo } from 'react';
import './index.less';
import { Button, Flex, Space, Upload, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useStepStore } from '../store';
import { useThreshold } from '@/utils/useThreshold';
import { useShallow } from 'zustand/react/shallow';
import PaperClipSvg from '@/assets/image/paper-clip.svg?react';
import Icon from '@ant-design/icons';

export const Replayer = () => {
  const { t } = useTranslation();
  const isMobile = useThreshold();
  const [prev, replayUrl, setReplayUrl] = useStepStore(
    useShallow((state) => [state.prev, state.replayUrl, state.setReplayUrl]),
  );
  const uploadCustomRequest: UploadProps['customRequest'] = (file) => {
    const blob = URL.createObjectURL(file.file as File);
    setReplayUrl(blob);
    return null;
  };
  const reusableButtons = useMemo(() => {
    return (
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={prev}>
          {t('common.back')}
        </Button>
        <Upload
          accept=".json"
          maxCount={1}
          customRequest={uploadCustomRequest}
          itemRender={() => null}
        >
          <Button
            type="primary"
            icon={<Icon component={PaperClipSvg} style={{ fontSize: 20 }} />}
          >
            {t('replay.select-log')}
          </Button>
        </Upload>
      </Space>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, t]);
  if (isMobile) {
    return (
      <Flex
        vertical
        justify="center"
        align="center"
        style={{ height: '100%', paddingInline: 20 }}
        gap={24}
      >
        <h2>{t('lab.only-pc')}</h2>
        <Button icon={<ArrowLeftOutlined />} onClick={prev}>
          {t('common.back')}
        </Button>
      </Flex>
    );
  }
  return (
    <div className="replayer-container">
      <LogReplayer url={replayUrl} backSlot={reusableButtons} />
    </div>
  );
};
