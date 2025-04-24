import { CodeBlock } from '@/components/CodeBlock';
import Icon from '@ant-design/icons';
import { Space, Flex } from 'antd';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JsDelivrSvg from '@/assets/image/jsdelivr.svg?react';
import UnpkgSvg from '@/assets/image/unpkg.svg?react';
import ChinaSvg from '@/assets/image/china.svg?react';
import './index.less';
import {
  OSPY_DOMESTIC,
  OSPY_JSDELIVR,
  OSPY_UNPKG,
  DOMESTIC_OSPY_URL,
} from '@/components/CodeBlock/internal';

interface Props {
  showConfig?: boolean;
}

export const ImportGuide = ({ showConfig = true }: Props) => {
  const { t } = useTranslation('translation', { keyPrefix: 'oSpy' });
  const INIT_CODE = useMemo(() => {
    return showConfig
      ? `const $oSpy = new OSpy({
  lang?: 'zh' | 'en';
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
  }, [t, showConfig]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cdnCode = (url: string) => {
    return `<script
  src="${url}"
  crossorigin="anonymous"
></script>
    
<script>
${INIT_CODE.split('\n')
  .map((i) => `  ${i}`)
  .join('\n')}
</script>`;
  };

  const methods = useMemo(() => {
    return [
      {
        title: 'CDN',
        code: (
          <CodeBlock
            group={[
              {
                title: (
                  <Flex align="center" gap={8}>
                    <Icon component={ChinaSvg} style={{ fontSize: 20 }} />
                    <span>{t('domestic')}</span>
                  </Flex>
                ),
                lang: 'html',
                ...(showConfig
                  ? {
                      code: cdnCode(DOMESTIC_OSPY_URL),
                    }
                  : {
                      internal: OSPY_DOMESTIC,
                    }),
              },
              {
                title: (
                  <Flex align="center" gap={8}>
                    <Icon component={JsDelivrSvg} style={{ fontSize: 20 }} />
                    <span>jsDelivr</span>
                  </Flex>
                ),
                lang: 'html',
                ...(showConfig
                  ? {
                      code: cdnCode(
                        'https://cdn.jsdelivr.net/npm/@huolala-tech/page-spy-plugin-ospy',
                      ),
                    }
                  : {
                      internal: OSPY_JSDELIVR,
                    }),
              },
              {
                title: (
                  <Flex align="center" gap={8}>
                    <Icon component={UnpkgSvg} style={{ fontSize: 20 }} />
                    <span>unpkg</span>
                  </Flex>
                ),
                lang: 'html',
                ...(showConfig
                  ? {
                      code: cdnCode(
                        'https://unpkg.com/@huolala-tech/page-spy-plugin-ospy',
                      ),
                    }
                  : {
                      internal: OSPY_UNPKG,
                    }),
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
  }, [INIT_CODE, cdnCode, t]);
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
      <div className="import-code" style={{ marginTop: 20 }}>
        {activeMethod?.code}
      </div>
    </div>
  );
};
