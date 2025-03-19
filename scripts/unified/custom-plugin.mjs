import { visit } from 'unist-util-visit';
import { mdxJsx } from 'micromark-extension-mdx-jsx';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxJsxFromMarkdown } from 'mdast-util-mdx-jsx';
import { formatSlug } from './utils.mjs';
import * as acorn from 'acorn';

const mdxAstBuilder = (md) => {
  const ast = fromMarkdown(md, {
    extensions: [mdxJsx({ acorn, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown()],
  });

  return ast;
};

// Markdown Syntax Extension
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
    }
  });
};

// Add `slug` prop to h1-h6
export const rehypeMdxSlug = () => (tree) => {
  visit(tree, 'element', (node) => {
    if (/h\d/.test(node.tagName)) {
      let slug = '';

      const customSlug = node.children.findLast(
        (child) => child.type === 'text' && child.value.includes('#'),
      );
      if (!customSlug) {
        slug = node.children.find((child) => child.type === 'text')?.value;
      } else {
        const [extra, _slug] = customSlug.value.split('#');
        customSlug.value = extra;
        slug = _slug;
      }

      if (!slug) {
        throw new Error(
          'Cannot compute `slug` which is required for heading in MDX',
        );
      }
      node.properties.slug = formatSlug(slug);
    }
  });
};
