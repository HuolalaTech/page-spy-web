import clsx from 'clsx';
import hljs from 'highlight.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './index.less';
import copy from 'copy-to-clipboard';
import { Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

interface Props {
  code: string;
  codeType?: string;
}

export const CodeBlock = ({ code, codeType = 'language-html' }: Props) => {
  const codeContent = useMemo(() => {
    return hljs.highlightAuto(code).value;
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
      <pre>
        <code
          className={clsx('hljs', codeType)}
          dangerouslySetInnerHTML={{
            __html: codeContent,
          }}
        />
      </pre>
    </div>
  );
};
