/* eslint-disable no-param-reassign */
import { PropsWithChildren, ReactNode, createElement } from 'react';
import { HeaderLink } from '../../HeaderLink';
import { isString } from 'lodash-es';
import { formatSlug } from '@/utils/docs';
import { debug } from '@/utils/debug';
interface Props {
  level: number;
}

// 标题的格式和自动生成的锚点规则：
// 1. 建议手动维护锚点，避免锚点异常；
// 2. 对缺失的锚点有以下自动生成规则：
// - 原文：### 标题
//   结果：<Link to={`#${formatSlug(标题)}`}>标题</Link>
//
// - 原文：### 标题#slug
//   结果：<Link to={`#${formatSlug(slug)}`}>标题</Link>
//
// - 原文：### 标题 <Component />
//   结果：<Link to={`#${formatSlug(标题)}`}>标题 <Component /></Link>
//
// - 原文：### 标题 <Component /> xxx#slug
//   结果：<Link to={`#${formatSlug(slug)}`}>标题 <Component />xxx</Link>

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
    const lastNode = nodes.splice(-1, 1)[0];
    if (isString(lastNode) && lastNode.indexOf('#') !== -1) {
      // ### 标题 <Component /> xxxx#slug
      const [extra, _slug] = lastNode.split('#');
      children = [...nodes, extra];
      slug = _slug;
    }
    if (!slug) {
      debug.error('标题未找到锚点，请检查后修复：', level, children);
      slug = nodes.find((i) => isString(i))?.trim() || '';
    }
  }

  return (
    <HeaderLink level={level} slug={formatSlug(slug)}>
      {createElement('div', {}, children)}
    </HeaderLink>
  );
};

export default Heading;
