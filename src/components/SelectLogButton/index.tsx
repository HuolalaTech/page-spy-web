import Icon from '@ant-design/icons';
import { UploadProps, Upload, Button, ButtonProps } from 'antd';
import { useTranslation } from 'react-i18next';
import PaperClipSvg from '@/assets/image/paper-clip.svg?react';

interface Props {
  onSelect: (url: string) => void;
  uploadProps?: UploadProps;
  buttonProps?: ButtonProps;
}

export const SelectLogButton = ({
  onSelect,
  uploadProps = {},
  buttonProps = {},
}: Props) => {
  const { t } = useTranslation();

  const uploadCustomRequest: UploadProps['customRequest'] = (file) => {
    const url = URL.createObjectURL(file.file as File);
    onSelect(url);
    return null;
  };
  return (
    <Upload
      accept=".json"
      maxCount={1}
      customRequest={uploadCustomRequest}
      itemRender={() => null}
      {...uploadProps}
    >
      <Button
        type="primary"
        icon={<Icon component={PaperClipSvg} style={{ fontSize: 20 }} />}
        {...buttonProps}
      >
        {t('replay.select-log')}
      </Button>
    </Upload>
  );
};
