import { useCallback, useEffect, useMemo, useState } from 'react';
import './index.less';
import copy from 'copy-to-clipboard';
import { Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import sh from '@/utils/shiki-highlighter';
import { useAsyncEffect } from 'ahooks';
import type { Lang } from 'shiki';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

interface Props {
  code?: string;
  dynamicCode?: (arg: {
    deployPath: string;
    deployUrl: string;
    t: TFunction;
  }) => string;
  lang?: Lang;
  showCopy?: boolean;
}

export const CodeBlock = ({
  code = '',
  dynamicCode = () => '',
  lang = 'html',
  showCopy = true,
}: Props) => {
  const { t } = useTranslation();
  const codeSource = useMemo(() => {
    const isDocMode = import.meta.env.MODE === 'doc';
    return (
      code ||
      dynamicCode({
        t,
        deployPath: isDocMode
          ? `<your-PageSpy-server-host>`
          : window.DEPLOY_BASE_PATH,
        deployUrl: isDocMode
          ? `https://<your-PageSpy-server-host>`
          : `${location.protocol}//${window.DEPLOY_BASE_PATH}`,
      })
    );
  }, [code, dynamicCode, t]);
  const [codeContent, setCodeContent] = useState('');
  useAsyncEffect(async () => {
    const highlighter = await sh.get({
      lang,
    });
    const content = highlighter.codeToHtml(codeSource, {
      lang,
    });
    setCodeContent(content);
  }, [code]);

  const [copyStatus, setCopyStatus] = useState(false);
  useEffect(() => {
    if (!copyStatus) return;
    const timer = setTimeout(() => {
      setCopyStatus(false);
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, [copyStatus]);

  const onCopy = useCallback(() => {
    if (copyStatus) return;
    const res = copy(codeSource);
    setCopyStatus(true);
  }, [codeSource, copyStatus]);

  if (!codeSource) return null;

  return (
    <div className="code-block">
      {showCopy && (
        <button className="copy-code" onClick={onCopy}>
          {copyStatus ? (
            <Space>
              <span>Copied</span>
              <CheckOutlined />
            </Space>
          ) : (
            'COPY'
          )}
        </button>
      )}
      <div
        dangerouslySetInnerHTML={{
          __html: codeContent,
        }}
      />
    </div>
  );
};
