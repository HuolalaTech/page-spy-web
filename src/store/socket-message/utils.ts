import { ElementContent, Root } from 'hast';
import rehypeDomParse from 'rehype-dom-parse';
import rehypeDomStrigify from 'rehype-dom-stringify';
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
      .use(rehypeDomParse)
      .use(fixHtmlSourceUriPlugin, { base })
      .use(rehypeDomStrigify)
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
