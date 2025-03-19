import { langType } from '@/utils/useLanguage';
import React, { createContext, useContext, useMemo } from 'react';
import { PropsWithChildren } from 'react';
import { DocNotFound } from './components/DocNotFound';
import { computeTocs, NavItem } from './components/DocContent/toc';

export const LOAD_DOC_EVENT = 'load-doc';

const lazyDocWithNotification =
  (doc: string, value: () => Promise<any>) => async () => {
    window.dispatchEvent(
      new CustomEvent(LOAD_DOC_EVENT, {
        detail: {
          doc,
          loading: true,
        },
      }),
    );
    const result = await value();
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(LOAD_DOC_EVENT, {
          detail: {
            doc,
            loading: false,
          },
        }),
      );
    }, 100);
    return result;
  };

export interface SidebarItem {
  label: string | Record<langType, string>;
  doc: string;
}

interface SidebarGroup {
  group: string | Record<langType, string>;
  children: SidebarItem[];
}

interface DocContextInfo {
  sidebar: SidebarGroup[];
  orderDocMenus: {
    doc: string;
    label: string | Record<langType, string>;
  }[];
  getContent: (
    doc: string,
    lang: langType,
  ) => React.LazyExoticComponent<any> | (() => JSX.Element);
  getToc: (doc: string, lang: langType) => Promise<NavItem[]>;
}

const defaultContext: DocContextInfo = {
  sidebar: [],
  orderDocMenus: [],
  getContent() {
    return DocNotFound;
  },
  getToc() {
    return Promise.resolve([]);
  },
};
const Context = createContext<DocContextInfo>(defaultContext);

export interface DocContextProps {
  sidebar: SidebarGroup[];
  mdxComponents: Record<string, () => Promise<any>>;
  mdRawContents: Record<string, () => Promise<string>>;
}

export const DocContext = ({
  children,
  sidebar,
  mdxComponents,
  mdRawContents,
}: PropsWithChildren<DocContextProps>) => {
  const orderDocMenus = useMemo(() => {
    return sidebar.reduce((acc, cur) => {
      const { children, group } = cur;
      const menus = children.map((item) => ({ ...item, group }));
      acc.push(...menus);
      return acc;
    }, [] as SidebarItem[]);
  }, [sidebar]);

  const value = useMemo<DocContextInfo>(() => {
    const components = Object.entries(mdxComponents).reduce((acc, cur) => {
      const [key, value] = cur;
      // 文档必须在 "md/" 目录下
      const result = key.match(/md\/(.+)\.(zh|en|ja|ko)\.mdx$/);
      if (!result) return acc;
      const [, doc, lang] = result;
      const lazyDoc = lazyDocWithNotification(doc, value);
      if (!acc[doc]) {
        acc[doc] = { [lang]: React.lazy(lazyDoc) };
      } else {
        acc[doc][lang] = React.lazy(lazyDoc);
      }
      return acc;
    }, {} as Record<string, Record<string, React.LazyExoticComponent<any> | (() => JSX.Element)>>);

    const tocs = Object.entries(mdRawContents);

    return {
      sidebar,
      orderDocMenus,
      getContent(doc, lang) {
        const docData = components[doc][lang] || components[doc]['en'];
        return docData;
      },
      async getToc(doc, lang) {
        const key = `${doc}.${lang}.mdx`;
        const toc = tocs.find(([k]) => k.includes(key));
        if (!toc) return [];
        const [, value] = toc;
        return computeTocs(value);
      },
    };
  }, [mdRawContents, mdxComponents, orderDocMenus, sidebar]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useDocContext = () => {
  return useContext(Context);
};
