import { useLanguage } from '@/utils/useLanguage';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import './index.less';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PrevSvg from '@/assets/image/prev.svg?react';
import NextSvg from '@/assets/image/next.svg?react';
import MenuSvg from '@/assets/image/menu.svg?react';
import Icon from '@ant-design/icons';
import { HeaderLink } from '../HeaderLink';
import { useEventListener } from '@/utils/useEventListener';
import { useSidebarStore } from '@/store/doc-sidebar';
import { useShallow } from 'zustand/react/shallow';
import { TransitionContext } from '@/components/Transition';
import components from './mdx-mapping';
import { ToC } from './toc';
import { LOAD_DOC_EVENT, SidebarItem, useDocContext } from '../../context';

const FooterLink = ({
  menu,
  flag,
}: {
  menu: SidebarItem | null;
  flag: 'prev' | 'next';
}) => {
  const [lang] = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startTransition } = useContext(TransitionContext);

  if (!menu) return null;

  return (
    <div
      className="footer-link"
      onClick={() => {
        startTransition(() => {
          navigate(menu.doc);
        });
      }}
    >
      <div className="footer-link__head">
        {flag === 'prev' && (
          <Icon component={PrevSvg} style={{ fontSize: 12 }} />
        )}
        <span>{flag === 'prev' ? t('common.prev') : t('common.next')}</span>
        {flag === 'next' && <Icon component={NextSvg} />}
      </div>
      <h4 className="footer-link__title">
        {typeof menu.label === 'string' ? menu.label : menu.label[lang]}
      </h4>
    </div>
  );
};

export const DocContent = () => {
  const [lang] = useLanguage();
  const { orderDocMenus, getContent } = useDocContext();
  const params = useParams();
  const currentDoc = useMemo(() => {
    return params['*'] || orderDocMenus[0].doc;
  }, [orderDocMenus, params]);

  const { prev, current, next } = useMemo(() => {
    const navigation: Record<string, SidebarItem | null> = {
      prev: null,
      current: null,
      next: null,
    };
    const index = orderDocMenus.findIndex((o) => o.doc === currentDoc);
    if (index < 0) return navigation;
    if (index === 0) {
      navigation.next = orderDocMenus[1];
    } else if (index === orderDocMenus.length - 1) {
      navigation.prev = orderDocMenus[index - 1];
    } else {
      navigation.prev = orderDocMenus[index - 1];
      navigation.next = orderDocMenus[index + 1];
    }
    navigation.current = orderDocMenus[index];
    return navigation;
  }, [currentDoc, orderDocMenus]);

  const rootRef = useRef<HTMLElement | null>(null);
  // 侧边/底部导航：切换文档，处理状态过渡
  const { inTransition } = useContext(TransitionContext);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (inTransition) {
      el.classList.add('loading');
    } else {
      el.classList.remove('loading');
    }
  }, [inTransition]);

  const { hash, pathname } = useLocation();
  const scrollIntoAnchor = useCallback(() => {
    if (!hash) return;

    const container = rootRef.current;
    const node = container?.querySelector(
      decodeURIComponent(hash),
    ) as HTMLElement;
    if (!container || !node) return;

    setTimeout(() => {
      const top = node.offsetTop - 100;
      container.scrollTo({
        top,
      });
    }, 100);
  }, [hash]);
  useEventListener(LOAD_DOC_EVENT, (e) => {
    const { detail } = e as CustomEvent;

    if (detail.loading === false) {
      scrollIntoAnchor();
    }
  });

  // 切换文档，回到顶部
  useEffect(() => {
    if (hash) return;
    rootRef.current?.scrollTo(0, 0);
  }, [hash, pathname]);

  // 点击锚点
  useEffect(scrollIntoAnchor, [scrollIntoAnchor]);

  const setShow = useSidebarStore(useShallow((state) => state.setShow));

  return (
    <main className="doc-content" ref={rootRef}>
      <div className="paragraph">
        <div className="content">
          {current && (
            <HeaderLink level={1} slug={current.doc}>
              {typeof current.label === 'string'
                ? current.label
                : current.label[lang]}
            </HeaderLink>
          )}

          {React.createElement(getContent(currentDoc, lang), {
            key: currentDoc,
            components,
          })}
        </div>
        <div className="navigation">
          <div className="navigation-prev">
            <FooterLink menu={prev} flag="prev" />
          </div>
          <div
            className="navigation-menus"
            onClick={() => {
              setShow(true);
            }}
          >
            <Icon component={MenuSvg} style={{ color: '#999', fontSize: 24 }} />
          </div>
          <div className="navigation-next">
            <FooterLink menu={next} flag="next" />
          </div>
        </div>
      </div>
      <ToC doc={currentDoc} lang={lang} />
    </main>
  );
};
