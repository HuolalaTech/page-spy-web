import { useCallback, useEffect, useState } from 'react';
import './index.less';
import copy from 'copy-to-clipboard';
import { Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import sh from '@/utils/shiki-highlighter';
import { useAsyncEffect } from 'ahooks';
import type { Lang } from 'shiki';

interface Props {
  code: string;
  lang?: Lang;
  showCopy?: boolean;
}

export const CodeBlock = ({
  code = '',
  lang = 'html',
  showCopy = true,
}: Props) => {
  const [codeContent, setCodeContent] = useState('');
  useAsyncEffect(async () => {
    const highlighter = await sh.get({
      lang,
    });
    const content = highlighter.codeToHtml(code, {
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
    const res = copy(code);
    setCopyStatus(true);
  }, [code, copyStatus]);

  if (!code) return null;

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
