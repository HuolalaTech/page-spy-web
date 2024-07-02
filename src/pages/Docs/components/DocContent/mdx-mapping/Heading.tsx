import { createElement } from 'react';
import { HeaderLink } from '../../HeaderLink';

interface Props {
  level: number;
  children: string;
}

// 格式：
// ### 标题#slug
const Heading = ({ level, children = '' }: Props) => {
  const [text, anchor] = children.toString().split('#');
  const anchorId = anchor ?? children.replace(/\./g, '_');

  return (
    <HeaderLink level={level} slug={anchorId}>
      {text.trim()}
    </HeaderLink>
  );
};

export default Heading;
