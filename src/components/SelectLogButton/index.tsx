import Icon from '@ant-design/icons';
import { UploadProps, Upload, Button, ButtonProps } from 'antd';
import { useTranslation } from 'react-i18next';
import PaperClipSvg from '@/assets/image/paper-clip.svg?react';
import { useEffect, useState } from 'react';
import './index.less';

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
  
  // 添加移动端检测
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
        icon={<Icon component={PaperClipSvg} style={{ fontSize: isMobile ? 16 : 20 }} />}
        size={isMobile ? "small" : "middle"}
        className={isMobile ? "mobile-select-btn" : ""}
        {...buttonProps}
      >
        {t('replay.select-log')}
      </Button>
    </Upload>
  );
};
