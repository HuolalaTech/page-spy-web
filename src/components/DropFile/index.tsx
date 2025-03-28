import { useEventListener } from '@/utils/useEventListener';
import { UploadOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
import clsx from 'clsx';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface Props {
  onDrop?: (url: string) => void;
}

export const DropFile = ({ onDrop }: Props) => {
  const navigate = useNavigate();
  const [msg, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const tipsRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEventListener('dragenter', () => {
    setIsDragOver(true);
  });

  return (
    <>
      {contextHolder}
      {isDragOver && (
        <div
          className="drop-mask"
          onDragOver={(e) => {
            e.preventDefault();
            const { clientX, clientY } = e;
            tipsRef.current!.style.left = `${clientX}px`;
            tipsRef.current!.style.top = `${clientY}px`;
          }}
          onDragLeave={() => {
            setIsDragOver(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (!file.name.endsWith('.json')) {
              await msg.open({
                type: 'loading',
                content: t('oSpy.unknown-type-warning'),
                duration: 1,
              });
            }
            const url = URL.createObjectURL(file);
            if (onDrop) {
              onDrop(url);
            } else {
              navigate(`/o-spy?url=${url}`);
            }
          }}
        />
      )}
      <div className={clsx('drop-tips', { show: isDragOver })} ref={tipsRef}>
        <UploadOutlined style={{ fontSize: 32 }} />
        <p>{t('oSpy.drop-file')}</p>
      </div>
    </>
  );
};
