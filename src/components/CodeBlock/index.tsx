import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import './index.less';
import copy from 'copy-to-clipboard';
import { Divider, Space } from 'antd';
import Icon from '@ant-design/icons';
import sh from '@/utils/shiki-highlighter';
import { Highlighter, type Lang } from 'shiki';
import CopySvg from '@/assets/image/copy.svg?react';
import CopiedSvg from '@/assets/image/copied.svg?react';
import clsx from 'clsx';
import { LoadingFallback } from '../LoadingFallback';

interface SingleProps {
  code: string;
  lang?: Lang;
  showCopy?: boolean;
}

type GroupItem = Omit<SingleProps, 'showCopy'> & { title: ReactNode };
interface GroupProps {
  group: GroupItem[];
  showCopy?: boolean;
}

function isGroupBlock(p: unknown): p is GroupProps {
  return !!(p as any).group;
}

export const CodeBlock = (data: SingleProps | GroupProps) => {
  const { showCopy = true } = data;
  const [active, setActive] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [bg, setBg] = useState('');
  const highlighter = useRef<Highlighter | null>(null);
  const handleCodeContent = async ({
    code,
    lang = 'javascript',
  }: Omit<SingleProps, 'showCopy'>) => {
    if (!highlighter.current) {
      highlighter.current = await sh.get({
        lang,
      });
    }
    const bg = highlighter.current.getBackgroundColor();
    const html = highlighter.current.codeToHtml(code, {
      lang,
    });
    setBg(bg);
    setUserCode(code);
    setCodeContent(html);
  };
  useEffect(() => {
    if (isGroupBlock(data)) {
      handleCodeContent(data.group[active]);
    } else {
      handleCodeContent(data);
    }
  }, [active, data]);

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
    const res = copy(userCode);
    setCopyStatus(res);
  }, [copyStatus, userCode]);

  if (!codeContent) return <LoadingFallback />;

  return (
    <div
      style={{ backgroundColor: bg }}
      className="code-block"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
          e.preventDefault();
          const selection = window.getSelection();
          const codeContent = e.currentTarget.querySelector(
            '.code-block-content',
          );
          if (selection && codeContent) {
            const range = document.createRange();
            range.selectNodeContents(codeContent);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }}
    >
      <div className="code-block-title">
        {isGroupBlock(data) &&
          data.group.map((c, index) => {
            return (
              <div
                key={index}
                className={clsx('title-item', {
                  active: active === index,
                })}
                onClick={() => {
                  setActive(index);
                }}
              >
                {c.title}
              </div>
            );
          })}
      </div>
      <div className="code-block-content">
        {showCopy && (
          <button className="copy-code" onClick={onCopy}>
            {copyStatus ? (
              <Space>
                <span>Copied</span>
                <Divider type="vertical" style={{ backgroundColor: '#666' }} />
                <Icon component={CopiedSvg} style={{ fontSize: 18 }} />
              </Space>
            ) : (
              <Icon component={CopySvg} style={{ fontSize: 18 }} />
            )}
          </button>
        )}
        <div
          dangerouslySetInnerHTML={{
            __html: codeContent,
          }}
        />
      </div>
    </div>
  );
};
