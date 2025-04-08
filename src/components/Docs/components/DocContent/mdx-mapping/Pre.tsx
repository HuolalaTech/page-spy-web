import { PropsWithChildren, ReactElement } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { useTranslation } from 'react-i18next';
import { deployPath, deployUrl } from '@/utils/constants';

const Pre = (props: PropsWithChildren<unknown>) => {
  const { t } = useTranslation();
  const { className, children } = (props.children as ReactElement).props;

  const language = className?.match(/language-(.*)/)?.[1] || 'html';

  // 代码块里可能会需要 i18n / 不同构建模式的输出不同 / 访问环境变量
  // - 使用i18n：{t('xxx')}
  // - 访问环境变量: {VITE_XXXX}
  // - 注入特殊变量:
  //   - {deployUrl}
  //   - {deployPath}
  const code = (children as string)
    .replace(/\{t\(['"](.*?)['"]\)\}/g, (_, key) => {
      return t(key);
    })
    .replace(/\{VITE_(.*?)\}/g, (_, key) => {
      return import.meta.env[`VITE_${key}`];
    })
    .replace(/\{deployUrl\}/g, deployUrl)
    .replace(/\{deployPath\}/g, deployPath);
  return <CodeBlock code={code} lang={language} />;
};

export default Pre;
