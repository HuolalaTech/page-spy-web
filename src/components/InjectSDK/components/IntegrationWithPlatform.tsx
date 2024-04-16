import { ReactComponent as WebSvg } from '@/assets/image/web-h5.svg';
import { ReactComponent as MiniprogramSvg } from '@/assets/image/miniprogram.svg';
import { ReactNode, useMemo, type ComponentType } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Lang } from 'shiki';
import { CodeBlock } from '@/components/CodeBlock';
import MPWarning from '@/components/MPWarning';

export type PlatformName = 'web' | 'mp';

export const PLATFORMS: { name: PlatformName; icon: ComponentType }[] = [
  {
    name: 'web',
    icon: WebSvg,
  },
  {
    name: 'mp',
    icon: MiniprogramSvg,
  },
];

interface Props {
  platform: PlatformName;
  onCloseModal: () => void;
}

export const IntegrationWithPlatform = ({ platform, onCloseModal }: Props) => {
  const { t } = useTranslation();
  const steps = useMemo(() => {
    const stepsWithPlatform = {
      web: [
        {
          title: t('inject.web.load-sdk'),
          code: `<script crossorigin="anonymous" src="${location.protocol}//${window.DEPLOY_BASE_PATH}/page-spy/index.min.js"></script>`,
        },
        {
          title: (
            <Trans i18nKey="inject.web.init-sdk">
              <span>slot-0</span>
              <a href={import.meta.env.VITE_SDK_BROWSER_REPO} target="_blank">
                slot-1
              </a>
            </Trans>
          ),
          code: `<script>
  window.$pageSpy = new PageSpy();
</script>`,
        },
        {
          title: (
            <Trans i18nKey="inject.web.plugins">
              <span>PageSpy 可以按需集成插件，用于拓展 SDK 的能力，例如：</span>
              <a href={import.meta.env.VITE_PLUGIN_RRWEB} target="_blank">
                录制 DOM 变化
              </a>
              <a href={import.meta.env.VITE_PLUGIN_DATA_HARBOR} target="_blank">
                离线缓存
              </a>
              <span>等功能，如有需要可以查看</span>
              <a href={import.meta.env.VITE_PLUGIN_DOC} target="_blank">
                插件详情
              </a>
            </Trans>
          ),
        },
      ],
      mp: [
        {
          title: t('inject.mp.install-sdk'),
          code: `# ${t('common.mpwechat')}
yarn add @huolala-tech/page-spy-wechat@latest

# ${t('common.mpalipay')}
yarn add @huolala-tech/page-spy-alipay@latest

# UniAPP
yarn add @huolala-tech/page-spy-uniapp@latest

# Taro
yarn add @huolala-tech/page-spy-taro@latest
`,
          lang: 'bash',
        },
        {
          title: t('inject.mp.request-host'),
          code: `https://${window.location.host}\nwss://${window.location.host}`,
        },
        {
          title: (
            <Trans i18nKey="inject.mp.init-sdk">
              <span>slot-0</span>
              <a href={import.meta.env.VITE_SDK_WECHAT_REPO} target="_blank">
                slot-1
              </a>
            </Trans>
          ),
          code: `import PageSpy from '@huolala-tech/page-spy-wechat';\n\nnew PageSpy({
  api: '${window.DEPLOY_BASE_PATH}',
})`,
          lang: 'js',
        },
      ],
    };
    return [
      ...stepsWithPlatform[platform],
      {
        title: (
          <span>
            {t('inject.end')}{' '}
            <Trans i18nKey="inject.start-debug">
              Start debugging by clicking the
              <Link to="/room-list" onClickCapture={onCloseModal}>
                Connections
              </Link>{' '}
              menu at the top!
            </Trans>
          </span>
        ),
        code: '',
      },
    ] as { title: ReactNode; code: string; lang?: Lang }[];
  }, [onCloseModal, platform, t]);

  return (
    <div className="platform-integratio">
      {platform === 'mp' && (
        <MPWarning
          style={{
            marginBottom: 12,
            borderRadius: 8,
          }}
          inline
        />
      )}

      {steps.map(({ title, code, lang = 'html' }, index) => {
        return (
          <div className="inject-steps" key={index}>
            <p className="inject-steps__title">
              {index + 1}. {title}
            </p>
            <CodeBlock code={code} lang={lang} />
          </div>
        );
      })}
    </div>
  );
};
