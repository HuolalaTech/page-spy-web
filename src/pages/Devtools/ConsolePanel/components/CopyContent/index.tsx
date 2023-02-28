import { message, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useCallback, useMemo } from 'react';
import copy from 'copy-to-clipboard';
import React from 'react';
import './index.less';

interface Props {
  content: string;
  rows?: number;
  length?: number;
}

const CopyContent: React.FC<Props> = ({ content, rows = 3, length = 120 }) => {
  const computedContent = useMemo(() => {
    if (typeof content !== 'string') return content;
    const paragraph = content.split('\n');
    if (paragraph.length > rows) {
      return `${paragraph.slice(0, rows).join('\n')} ...`;
    }
    if (content.length > length) {
      return `${content.slice(0, length)}...`;
    }
    return content;
  }, [content, length, rows]);

  const onCopy = useCallback(() => {
    const copyResult = copy(`${content}`);
    if (copyResult) {
      message.success('Copy success');
    } else {
      message.error('Copy failed');
    }
  }, [content]);

  if (computedContent === content) return <>{content}</>;

  return (
    <span className="copyable">
      <span className="copyable-content">{computedContent}</span>
      <Tooltip title="Copy">
        <span className="copyable-icon" onClick={onCopy}>
          <CopyOutlined />
        </span>
      </Tooltip>
    </span>
  );
};

export default CopyContent;
