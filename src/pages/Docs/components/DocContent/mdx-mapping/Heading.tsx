/* eslint-disable no-param-reassign */
import { PropsWithChildren, ReactNode, createElement } from 'react';
import { HeaderLink } from '../../HeaderLink';
import { isString } from 'lodash-es';
import { formatSlug } from '@/utils/docs';

interface Props {
  level: number;
}

// 标题的格式和自动生成的锚点规则：
// - 原文：### 标题
//   结果：<Link to={`#${formatSlug(<标题>)}`}>标题</Link>
//
// - 原文：### 标题#slug
//   结果：<Link to={`#${formatSlug(slug)}`}>标题</Link>
//
// - 原文：### 标题 <Component />
//   结果：<Link to={`#${formatSlug(<标题>)}`}>标题 <Component /></Link>
//
// - 原文：### 标题 <Component />#slug
//   结果：<Link to={`#${formatSlug(slug)}`}>标题 <Component /></Link>

const Heading = ({ level, children }: PropsWithChildren<Props>) => {
  let slug = '';
  if (!children) return null;

  // ### 标题#slug
  if (isString(children)) {
    [children, slug] = children.split('#');
    // ### 标题
    if (!slug) {
      slug = (children as string).trim();
    }
  } else {
    const nodes: ReactNode[] = [...(children as ReactNode[])];
    const slugIndex = nodes.findIndex((i) => isString(i) && i.startsWith('#'));
    if (slugIndex !== -1) {
      // ### 标题 <Component />#slug
      slug = nodes.splice(slugIndex, 1)[0]?.toString().slice(1) || '';
      children = nodes;
    } else {
      // ### 标题 <Component />
      const title = nodes.find((i) => isString(i))?.trim() || '';
      slug = title;
    }
  }

  return (
    <HeaderLink level={level} slug={formatSlug(slug)}>
      {createElement('div', {}, children)}
    </HeaderLink>
  );
};

export default Heading;
