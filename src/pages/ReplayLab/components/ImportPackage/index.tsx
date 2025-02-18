import { Flex, Space } from 'antd';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';
import JsDelivrSvg from '@/assets/image/jsdelivr.svg?react';
import UnpkgSvg from '@/assets/image/unpkg.svg?react';
import Icon from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export const ImportPackage = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'lab' });
  const methods = useMemo(() => {
    const INIT_CODE = `const $feedback = new WholeBundle({
  title?: string; // ${t('comment-title')}
  logo?: string; // ${t('comment-logo')}
  primaryColor?: string; // ${t('comment-primaryColor')}
  autoRender?: boolean; // ${t('comment-autoRender')}
})`;
    return [
      {
        title: 'CDN',
        code: (
          <CodeBlock
            group={[
              {
                title: (
                  <Space>
                    <Icon component={JsDelivrSvg} style={{ fontSize: 20 }} />
                    <span>jsDelivr</span>
                  </Space>
                ),
                lang: 'javascript',
                code: `<script
  src="https://cdn.jsdelivr.net/npm/@huolala-tech/page-spy-plugin-whole-bundle"
  crossorigin="anonymous">
</script>

${INIT_CODE}`,
              },
              {
                title: (
                  <Space>
                    <Icon component={UnpkgSvg} style={{ fontSize: 20 }} />
                    <span>unpkg</span>
                  </Space>
                ),
                lang: 'javascript',
                code: `<script
  src="https://unpkg.com/@huolala-tech/page-spy-plugin-whole-bundle"
  crossorigin="anonymous">
</script>

${INIT_CODE}`,
              },
            ]}
          />
        ),
      },
      {
        title: 'NPM',
        code: (
          <Flex vertical gap={12}>
            <h5>{t('install-1st')}</h5>
            <CodeBlock
              lang="bash"
              code="yarn add @huolala-tech/page-spy-plugin-whole-bundle"
            />
            <h5>{t('install-2nd')}</h5>
            <CodeBlock
              lang="javascript"
              code={`import WholeBundle from '@huolala-tech/page-spy-plugin-whole-bundle';
import '@huolala-tech/page-spy-plugin-whole-bundle/dist/index.css';

${INIT_CODE}`}
            />
          </Flex>
        ),
      },
    ];
  }, []);
  const [active, setActive] = useState<string>(methods[0].title);
  const activeMethod = methods.find((i) => i.title === active);
  return (
    <Flex
      vertical
      justify="center"
      align="center"
      gap={20}
      className="import-package"
    >
      <h1 style={{ textAlign: 'center' }}>{t('install-title')}</h1>
      <h5>{t('install-desc')}</h5>
      <Flex gap={8}>
        {methods.map(({ title }) => (
          <strong
            key={title}
            className={clsx('method-title', {
              active: title === active,
            })}
            onClick={() => {
              setActive(title);
            }}
          >
            {title}
          </strong>
        ))}
      </Flex>
      <div className="import-code">
        {activeMethod?.code}
        <h5 style={{ marginTop: 12, textAlign: 'center' }}>
          {t('install-result')}
        </h5>
      </div>
    </Flex>
  );
};
