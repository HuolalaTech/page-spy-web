/* eslint-disable no-param-reassign */
import { ReactNode, createElement } from 'react';
import { HeaderLink } from '../../HeaderLink';

interface Props {
  level: number;
  children: string | ReactNode[];
}

// 格式：
// ### 标题#slug
const Heading = ({ level, children }: Props) => {
  let slug = '';
  if (typeof children === 'string') {
    [children, slug] = children.toString().split('#');
    if (!slug) {
      slug = children.replace(/\./g, '_');
    }
  } else {
    const nodes: ReactNode[] = [...children];
    const last = nodes.pop();
    if (last && typeof last === 'string') {
      const [content, anchor] = last.toString().split('#');
      children = nodes.concat(content);
      slug = anchor;
    }
  }

  return (
    <HeaderLink level={level} slug={slug}>
      {createElement('div', {}, children)}
    </HeaderLink>
  );
};

export default Heading;
