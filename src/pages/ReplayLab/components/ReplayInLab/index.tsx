import { LogReplayer } from '@/components/LogReplayer';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import './index.less';
import { Button, Flex, Space, Upload, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined, FileSearchOutlined } from '@ant-design/icons';
import { useStepStore } from '../store';
import { useThreshold } from '@/utils/useThreshold';

export const ReplayInLab = () => {
  const { t } = useTranslation();
  const isMobile = useThreshold();
  const [url, setUrl] = useState('');
  const uploadCustomRequest: UploadProps['customRequest'] = (file) => {
    const blob = URL.createObjectURL(file.file as File);
    setUrl(blob);
    return null;
  };
  const goto = useStepStore((state) => state.goto);
  const reusableButtons = useMemo(() => {
    return (
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => goto(0)}>
          {t('lab.guide')}
        </Button>
        <Upload
          accept=".json"
          maxCount={1}
          customRequest={uploadCustomRequest}
          itemRender={() => null}
        >
          <Button type="primary" icon={<FileSearchOutlined />}>
            {t('replay.select-log')}
          </Button>
        </Upload>
      </Space>
    );
  }, [goto, t]);
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
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            goto(0);
          }}
        >
          {t('common.back')}
        </Button>
      </Flex>
    );
  }
  return (
    <div
      className="replay-in-lab"
      onWheel={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className={clsx('replayer-wrapper', {
          pending: !url,
        })}
      >
        <LogReplayer url={url} backSlot={reusableButtons} />
      </div>

      {!url && <div className="select-local-file">{reusableButtons}</div>}
    </div>
  );
};
