import { visit } from 'unist-util-visit';
import { mdxJsx } from 'micromark-extension-mdx-jsx';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxJsxFromMarkdown } from 'mdast-util-mdx-jsx';
import { removePosition } from 'unist-util-remove-position';
import { parse } from 'acorn';

const generateCodeGroupAst = (md) => {
  const ast = fromMarkdown(md, {
    extensions: [mdxJsx()],
    mdastExtensions: [mdxJsxFromMarkdown()],
  });

  removePosition(ast, { force: true });

  let result;
  visit(ast, 'mdxJsxFlowElement', (node) => {
    result = node;
    const itemsAttribute = result.attributes.find(
      (attr) => attr.name === 'items',
    );
    const jsonValue = itemsAttribute.value.value;
    const estree = parse(jsonValue, { ecmaVersion: 2020 });

    itemsAttribute.value.data = {
      estree,
    };
  });

  return result;
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

      parent.children[index] = generateCodeGroupAst(
        `<code-group items={${JSON.stringify(children)}} />`,
      );
    }
  });
};
