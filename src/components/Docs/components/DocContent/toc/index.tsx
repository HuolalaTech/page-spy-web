import { useEffect, useState } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { langType } from '@/utils/useLanguage';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { formatSlug } from '@/utils/docs';
import { useDocContext } from '@/components/Docs/context';

export interface NavItem {
  text: string;
  link: string;
}

const processor = unified().use(remarkParse);

// 目录生成规则参照 ../mdx-mapping/Heading.tsx
export const computeTocs = async (raw: () => Promise<string>) => {
  const navs: NavItem[] = [];
  try {
    const content = await raw();
    const tree = processor.parse(content);
    visit(tree, 'heading', (node) => {
      if ([2, 3].includes(node.depth)) {
        // ## abcd     =>  text
        // ## <XYZ />  =>  html
        const texts = node.children.filter((i) => i.type === 'text');
        if (!texts.length) {
          console.error('当前 heading 自动提取 anchor 失败', node);
          return;
        }

        let text: string = '';
        let link: string = '';

        // ## title <Component>#slug => [text, html, text]
        const customSlug = texts.findLast((i) => i.value.startsWith('#'));
        if (customSlug) {
          text = texts[0].value;
          link = customSlug.value.slice(1);
        } else {
          // ## title
          const [head, anchor] = texts[0].value.split('#');
          text = head;
          link = anchor || head;
        }

        navs.push({
          text: text.trim(),
          link: formatSlug(link),
        });
      }
    });
  } catch (e) {
    //
  }

  return navs;
};

export const ToC = ({ doc, lang }: { doc: string; lang: langType }) => {
  const { tocs } = useDocContext();
  const [navs, setNavs] = useState<NavItem[]>([]);
  const { t } = useTranslation();
  const { hash } = useLocation();

  useEffect(() => {
    const fn = async () => {
      try {
        const p = tocs[doc][lang];
        if (!p) return;

        const data = await p;
        setNavs(data);
      } catch (e) {
        //
      }
    };
    fn();
  }, [doc, lang, tocs]);

  return (
    <div className="toc">
      {navs.length !== 0 && (
        <>
          <p>
            <b>{t('common.toc')}</b>
          </p>
          <div className="toc-navs">
            {navs.map((i) => {
              const to = `#${i.link}`;
              return (
                <div key={i.text} className="toc-navs__item">
                  <Link
                    to={to}
                    className={clsx({
                      active: hash === to,
                    })}
                  >
                    {i.text}
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
