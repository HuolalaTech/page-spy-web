import { useEventListener } from '@/utils/useEventListener';
import { UploadOutlined } from '@ant-design/icons';
import { MutableRefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
import clsx from 'clsx';
import { message } from 'antd';

interface Props {
  container: MutableRefObject<HTMLDivElement | null>;
  onDrop: (url: string) => void;
}

export const DropFile = ({ onDrop, container }: Props) => {
  const [msg, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const tipsRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const target = container.current;

  useEventListener(
    'dragenter',
    () => {
      setIsDragOver(true);
    },
    { target },
  );

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
            onDrop(url);
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
