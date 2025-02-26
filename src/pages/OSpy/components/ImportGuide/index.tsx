import { CodeBlock } from '@/components/CodeBlock';
import Icon from '@ant-design/icons';
import { Space, Flex } from 'antd';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JsDelivrSvg from '@/assets/image/jsdelivr.svg?react';
import UnpkgSvg from '@/assets/image/unpkg.svg?react';
import './index.less';

interface Props {
  showConfig?: boolean;
}

export const ImportGuide = ({ showConfig = true }: Props) => {
  const { t } = useTranslation('translation', { keyPrefix: 'oSpy' });
  const methods = useMemo(() => {
    const INIT_CODE = showConfig
      ? `const $oSpy = new OSpy({
    title?: string; // ${t('comment-title')}
    logo?: string; // ${t('comment-logo')}
    primaryColor?: string; // ${t('comment-primaryColor')}
    autoRender?: boolean; // ${t('comment-autoRender')}
    exportButtonText?: string; // ${t('comment-exportButtonText')}
    onExportButtonClick?: (data: CacheMessageItem[]) => void; // ${t(
      'comment-onExportButtonClick',
    )}
  });`
      : `const $oSpy = new OSpy();`;

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
                code: `<script src="https://cdn.jsdelivr.net/npm/@huolala-tech/page-spy-plugin-ospy" crossorigin="anonymous"></script>

<script>
  ${INIT_CODE}
</script>`,
              },
              {
                title: (
                  <Space>
                    <Icon component={UnpkgSvg} style={{ fontSize: 20 }} />
                    <span>unpkg</span>
                  </Space>
                ),
                lang: 'javascript',
                code: `<script src="https://unpkg.com/@huolala-tech/page-spy-plugin-ospy" crossorigin="anonymous"></script>

<script>
  ${INIT_CODE}
</script>`,
              },
            ]}
          />
        ),
      },
      {
        title: 'NPM',
        code: (
          <Flex vertical gap={12}>
            <p style={{ margin: 0 }}>{t('install-1st')}</p>
            <CodeBlock
              lang="bash"
              code="yarn add @huolala-tech/page-spy-plugin-ospy"
            />
            <p style={{ margin: 0 }}>{t('install-2nd')}</p>
            <CodeBlock
              lang="javascript"
              code={`import OSpy from '@huolala-tech/page-spy-plugin-ospy';
import '@huolala-tech/page-spy-plugin-ospy/dist/index.css';

${INIT_CODE}`}
            />
          </Flex>
        ),
      },
    ];
  }, [t]);
  const [active, setActive] = useState<string>(methods[0].title);
  const activeMethod = methods.find((i) => i.title === active);
  return (
    <div className="import-guide">
      <Flex gap={8} justify="center">
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
      <div
        className="import-code"
        style={{ marginTop: active === methods[0].title ? 20 : 0 }}
      >
        {activeMethod?.code}
      </div>
    </div>
  );
};
