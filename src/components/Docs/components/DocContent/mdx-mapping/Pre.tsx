import { PropsWithChildren, ReactElement } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { useTranslation } from 'react-i18next';

const Pre = (props: PropsWithChildren<unknown>) => {
  const { t } = useTranslation();
  const { className, children } = (props.children as ReactElement).props;

  const language = className?.match(/language-(.*)/)?.[1] || 'html';

  return <CodeBlock code={children} lang={language} />;
};

export default Pre;
