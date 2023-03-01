import React from 'react';
import { unified } from 'unified';
import domParse from 'rehype-dom-parse';
import domStringify from 'rehype-dom-stringify';
import { CaretRightOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import './index.less';
import type { VFile } from 'vfile';
import type { ElementContent, Element, Text } from 'hast';
import { camelcaseToHypen, replaceProperties } from './utils';

const processor = unified()
  .use(domParse)
  .use(domStringify)
  .data('settings', { fragment: false });

type BlockContent = Text & {
  lang: string;
};

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);

const tag2lang = {
  style: 'css',
  script: 'javascript',
};

function hasMemebers(data: any) {
  return !!data && Object.keys(data).length > 0;
}

const ElementAttrs: React.FC<{ data?: Record<string, any> }> = ({
  data = {},
}) => {
  const attrs = useMemo(() => {
    if (!hasMemebers(data)) return '';
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

function ElementItem({ ast }: { ast: ElementContent }) {
  const [spread, setSpread] = useState(false);
  const { type } = ast;
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
              {spread ? <ElementNode ast={children} /> : '...'}
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
    const { value, lang = 'text' } = ast as BlockContent;
    const content = value.trim();
    if (!content) return null;
    const htmlString = hljs.highlight(content, {
      language: lang,
    }).value;
    return (
      <code
        className="element-item plain-text"
        dangerouslySetInnerHTML={{ __html: htmlString }}
      />
    );
  }
  return null;
}

function ElementNode({ ast }: { ast: ElementContent[] }) {
  return (
    <div className="element-node">
      {ast.map((item, index) => {
        if (item.type === 'element') {
          if (
            (item.tagName === 'style' || item.tagName === 'script') &&
            item.children.length === 1
          ) {
            (item.children as BlockContent[]).forEach((textItem) => {
              // eslint-disable-next-line no-param-reassign
              textItem.lang = tag2lang[item.tagName as keyof typeof tag2lang];
            });
          }
        }
        return (
          // eslint-disable-next-line react/no-array-index-key
          <ElementItem ast={item} key={index} />
        );
      })}
    </div>
  );
}

export const ElementPanel: React.FC<{ html: string }> = ({ html }) => {
  const [ast, setAst] = useState<ElementContent[]>([]);
  useEffect(() => {
    if (!html) return;
    processor.process(html).then((file: VFile) => {
      const data = processor.parse(file);
      if (data.type === 'root') {
        setAst(data.children as ElementContent[]);
      }
    });
  }, [html]);
  return (
    <div className="element-panel">
      <ElementNode ast={ast} />
    </div>
  );
};
