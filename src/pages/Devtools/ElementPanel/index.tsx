import React, { memo } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import './index.less';
import type { ElementContent, Element } from 'hast';
import { camelcaseToHypen, replaceProperties } from './utils';
import { useSocketMessageStore } from '@/store/socket-message';
import { useAsyncEffect } from 'ahooks';
import sh from '@/utils/shiki-highlighter';
import type { Lang } from 'shiki';

const tag2lang = {
  style: 'css',
  script: 'javascript',
} as const;

const getTextBlockLang = (parentNode: Element) => {
  const { tagName, children } = parentNode;
  if (['script', 'style'].includes(tagName)) {
    if (children && children.length === 1) {
      return tag2lang[tagName as keyof typeof tag2lang];
    }
  }
  return 'text';
};

function hasMembers(data: any) {
  return !!data && Object.keys(data).length > 0;
}

const ElementAttrs: React.FC<{ data?: Record<string, any> }> = ({
  data = {},
}) => {
  const attrs = useMemo(() => {
    if (!hasMembers(data)) return '';
    return Object.entries(data).map(([key, val]) => {
      const prop = camelcaseToHypen(replaceProperties(key));
      return (
        <span className="attrs-item" key={key}>
          {' '}
          <span className="attrs-item__name">{prop}</span>
          {!!val && (
            <>
              =&quot;
              <span className="attrs-item__value">{val}</span>
              &quot;
            </>
          )}
        </span>
      );
    });
  }, [data]);
  return <span className="element-attrs">{attrs}</span>;
};

function ElementItem({
  ast,
  lang = 'text',
}: {
  ast: ElementContent;
  lang: string;
}) {
  const [spread, setSpread] = useState(false);
  const { type } = ast;

  const [textContent, setTextContent] = useState('');
  useAsyncEffect(async () => {
    if (type !== 'text') return;

    const { value } = ast;
    const content = value.trim();
    if (!content) {
      setTextContent('');
      return;
    }
    const highlighter = await sh.get({
      lang: lang as Lang,
      theme: 'github-light',
    });
    const result = highlighter.codeToHtml(content, {
      lang,
      theme: 'github-light',
    });
    setTextContent(result);
  }, [ast]);

  if (type === 'element') {
    const { tagName, properties, children } = ast as Element;

    return (
      <code className="element-item">
        <div className="element-controller">
          {children.length > 0 && (
            <CaretRightOutlined
              className="element-controller__btn"
              rotate={spread ? 90 : 0}
              onClick={() => {
                setSpread(!spread);
              }}
            />
          )}
        </div>
        <div className="element-content">
          <span className="element-content__header">
            <span>&lt;</span>
            <span className="tag-name">{tagName}</span>
            <ElementAttrs data={properties} />
            <span>&gt;</span>
          </span>
          {children.length > 0 ? (
            <span className="element-content__body">
              {spread ? (
                <ElementNode ast={children} lang={getTextBlockLang(ast)} />
              ) : (
                '...'
              )}
            </span>
          ) : (
            ''
          )}
          <span className="element-content__footer">
            <span>&lt;</span>
            <span className="tag-name">/{tagName}</span>
            <span>&gt;</span>
          </span>
        </div>
      </code>
    );
  }
  if (type === 'text') {
    return (
      <div
        className="element-item plain-text"
        dangerouslySetInnerHTML={{ __html: textContent }}
      />
    );
  }

  if (type === 'comment') {
    return (
      <code className="element-item comment">{`<!-- ${ast.value} -->`}</code>
    );
  }
  return null;
}

export function ElementNode({
  ast,
  lang = 'text',
}: {
  ast: ElementContent[];
  lang?: string;
}) {
  return (
    <div className="element-node">
      {ast.map((item, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <ElementItem ast={item} lang={lang} key={index} />
        );
      })}
    </div>
  );
}

export const ElementPanel = memo(() => {
  const ast = useSocketMessageStore((state) => state.pageMsg.tree);

  if (!ast) return null;
  return (
    <div className="element-panel">
      <ElementNode ast={ast} />
    </div>
  );
});
