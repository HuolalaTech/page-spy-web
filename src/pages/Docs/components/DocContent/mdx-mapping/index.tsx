import { PropsWithChildren, ReactNode } from 'react';
import Heading from './Heading';
import Pre from './Pre';
import A from './A';

const components: Record<string, (props: PropsWithChildren<any>) => ReactNode> =
  {
    h1: (props) => <Heading level={1} {...props} />,
    h2: (props) => <Heading level={2} {...props} />,
    h3: (props) => <Heading level={3} {...props} />,
    h4: (props) => <Heading level={4} {...props} />,
    h5: (props) => <Heading level={5} {...props} />,
    h6: (props) => <Heading level={6} {...props} />,
    pre: Pre,
    a: A,
  };

export default components;
