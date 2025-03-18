import { SKIP, visit } from 'unist-util-visit';
import { mdxJsx } from 'micromark-extension-mdx-jsx';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxJsxFromMarkdown } from 'mdast-util-mdx-jsx';
import * as acorn from 'acorn';

const mdxAstBuilder = (md) => {
  const ast = fromMarkdown(md, {
    extensions: [mdxJsx({ acorn, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown()],
  });

  return ast;
};

// :::code-group
// ```bash npm
// npm install xxx
// ```
// ```bash yarn
// yarn add xxx
// ```
// :::
export const remarkMdxCodeGroup = () => (tree) => {
  visit(tree, 'containerDirective', (node, index, parent) => {
    if (node.name === 'code-group') {
      const children = node.children
        .filter((child) => child.type === 'code')
        .map((code) => {
          const lang = code.lang || '';
          const meta = code.meta || '';
          const value = code.value || '';

          return { lang, meta, value };
        });

      parent.children.splice(
        index,
        1,
        mdxAstBuilder(`<code-group items={${JSON.stringify(children)}} />`),
      );

      return [SKIP, index];
    }
  });
};
