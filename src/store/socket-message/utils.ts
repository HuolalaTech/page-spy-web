import { resolveUrlInfo } from '@/utils';
import { SpyNetwork } from '@huolala-tech/page-spy-types';
import { ElementContent, Root } from 'hast';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { Plugin, unified } from 'unified';
import { visit } from 'unist-util-visit';

const fixHtmlSourceUriPlugin: Plugin<[{ base: string }], Root, Root> =
  ({ base }) =>
  (tree) => {
    visit(
      tree,
      (node: any) =>
        ['img', 'video', 'audio', 'link', 'source'].includes(node.tagName),
      (node: any) => {
        const { src, href } = node.properties || {};
        if (src) {
          node.properties.src = new URL(src, base);
        }
        if (href) {
          node.properties.href = new URL(href, base);
        }
      },
    );
  };

export const getFixedPageMsg = async (htmlText: string, base: string) => {
  try {
    const processor = unified()
      .use(rehypeParse)
      .use(fixHtmlSourceUriPlugin, { base })
      .use(rehypeStringify)
      .data('settings', { fragment: false });

    const file = await processor.process(htmlText);
    const html = file.toString();

    const tree = processor.parse(file).children as ElementContent[];
    return {
      tree,
      html,
    };
  } catch (e) {
    console.error(e);
    return {
      tree: null,
      html: '',
    };
  }
};

// 处理小程序网络信息
export const processMPNetworkMsg = (data: SpyNetwork.RequestInfo) => {
  // why the requestPayload should be string? because the js object will be stringified in sdk.
  if (
    data.url &&
    data.method.toUpperCase() === 'GET' &&
    data.requestPayload &&
    typeof data.requestPayload === 'string'
  ) {
    try {
      const obj = JSON.parse(data.requestPayload);
      if (data.getData) {
        data.getData.forEach(([k, v]) => {
          if (!Reflect.has(obj, k)) {
            obj[k] = JSON.stringify(v);
          }
        });
      }
      data.getData = Object.entries(obj);
      data.requestPayload = null;

      const { origin, pathname } = new URL(data.url);
      const query = new URLSearchParams(data.getData).toString();
      data.url = `${origin}${pathname}?${query}`;
    } catch (e) {
      // do nothing
    }
  }
};
