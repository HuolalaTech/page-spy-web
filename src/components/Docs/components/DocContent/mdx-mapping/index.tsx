import Pre from './Pre';
import A from './A';
import { MDXComponents } from 'mdx/types';
import { CodeGroup } from './CodeGroup';
import { HeaderLink } from '../../HeaderLink';
import { PropsWithChildren } from 'react';

/**
 * `slug` auto filled by rehypeMdxSlug.
 * @see /unified.config.mjs
 */
type HeadingProps = PropsWithChildren<{ slug: string }>;

const components: MDXComponents = {
  h1: (props) => <HeaderLink level={1} {...(props as HeadingProps)} />,
  h2: (props) => <HeaderLink level={2} {...(props as HeadingProps)} />,
  h3: (props) => <HeaderLink level={3} {...(props as HeadingProps)} />,
  h4: (props) => <HeaderLink level={4} {...(props as HeadingProps)} />,
  h5: (props) => <HeaderLink level={5} {...(props as HeadingProps)} />,
  h6: (props) => <HeaderLink level={6} {...(props as HeadingProps)} />,
  pre: Pre,
  a: A,
  'code-group': CodeGroup,
};

export default components;
