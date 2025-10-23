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
import { debug } from '@/utils/debug';

export interface NavItem {
  text: string;
  link: string;
  depth: number;
  children?: NavItem[];
}

const processor = unified().use(remarkParse);

export const computeTocs = async (raw: () => Promise<string>) => {
  const flatNavs: NavItem[] = [];
  try {
    const content = await raw();
    const tree = processor.parse(content);
    visit(tree, 'heading', (node) => {
      if ([2, 3].includes(node.depth)) {
        // ## abcd     =>  text
        // ## <XYZ />  =>  html
        // ## title <Component> title#slug => [text, html, text]
        const texts = node.children.filter((i) => i.type === 'text');
        // if (texts.some((i) => i.value.includes('v2.2.0'))) {
        //   console.log(texts, node);
        // }
        if (!texts.length) {
          debug.panic('TOC 未找到合适的标题作为锚点', node);
          return;
        }

        let text: string = '';
        let link: string = '';

        if (texts.length === 1) {
          const [head, anchor] = texts[0].value.split('#');
          text = head;
          link = anchor || head;
        } else {
          text = texts[0].value;
          const lastNode = texts[texts.length - 1].value;
          if (lastNode.indexOf('#') !== -1) {
            link = lastNode.split('#')[1];
          } else {
            link = text.trim();
          }
        }
        if (!link) {
          debug.panic('TOC 未找到合适的锚点', node);
        }

        flatNavs.push({
          text: text.trim(),
          link: formatSlug(link),
          depth: node.depth,
        });
      }
    });
  } catch (e) {
    //
  }

  const hierarchicalNavs: NavItem[] = [];
  let currentH2: NavItem | null = null;

  for (const nav of flatNavs) {
    if (nav.depth === 2) {
      currentH2 = { ...nav, children: [] };
      hierarchicalNavs.push(currentH2);
      continue;
    }
    if (nav.depth === 3) {
      if (currentH2) {
        currentH2.children!.push(nav);
      } else {
        hierarchicalNavs.push(nav);
      }
    }
  }

  return hierarchicalNavs;
};

export const ToC = ({ doc, lang }: { doc: string; lang: langType }) => {
  const { getToc } = useDocContext();
  const [navs, setNavs] = useState<NavItem[]>([]);
  const { t } = useTranslation();
  const { hash } = useLocation();

  useEffect(() => {
    const fn = async () => {
      try {
        const data = await getToc(doc, lang);
        setNavs(data);
      } catch (e) {
        //
      }
    };
    fn();
  }, [doc, getToc, lang]);

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
                      active: decodeURIComponent(hash) === to,
                    })}
                  >
                    {i.text}
                  </Link>
                  {i.children && i.children.length > 0 && (
                    <div className="toc-navs__children">
                      {i.children.map((child) => {
                        const childTo = `#${child.link}`;
                        return (
                          <div key={child.text} className="toc-navs__item">
                            <Link
                              to={childTo}
                              className={clsx({
                                active: decodeURIComponent(hash) === childTo,
                              })}
                            >
                              {child.text}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
