import { ReactComponent as WebSvg } from '@/assets/image/web-h5.svg';
import { ReactComponent as MiniprogramSvg } from '@/assets/image/miniprogram.svg';
import { ReactComponent as UniAppSvg } from '@/assets/image/uni.svg';
import { ReactNode, useMemo, type ComponentType } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Lang } from 'shiki';
import { CodeBlock } from '@/components/CodeBlock';

export type PlatformName = 'web' | 'mp-wechat' | 'mp-uniapp';

export const PLATFORMS: { name: PlatformName; icon: ComponentType }[] = [
  {
    name: 'web',
    icon: WebSvg,
  },
  {
    name: 'mp-wechat',
    icon: MiniprogramSvg,
  },
  {
    name: 'mp-uniapp',
    icon: UniAppSvg,
  },
];

interface Props {
  platform: PlatformName;
  onCloseModal: () => void;
}

export const IntegrationWithPlatform = ({ platform, onCloseModal }: Props) => {
  const { t } = useTranslation();
  const deployPath = (location.host + location.pathname).replace(/\/+$/, '');
  const steps = useMemo(() => {
    const stepsWithPlatform = {
      web: [
        {
          title: t('inject.web.load-sdk'),
          code: `<script crossorigin="anonymous" src="${location.protocol}//${deployPath}/page-spy/index.min.js"></script>`,
        },
        {
          title: (
            <Trans i18nKey="inject.web.init-sdk">
              <span>slot-0</span>
              <a
                href="https://github.com/HuolalaTech/page-spy/tree/main/packages/page-spy-browser"
                target="_blank"
              >
                slot-1
              </a>
            </Trans>
          ),
          code: `<script>
  window.$pageSpy = new PageSpy();
</script>`,
        },
      ],
      'mp-wechat': [
        {
          title: t('inject.mp-wechat.install-sdk'),
          code: `yarn add @huolala-tech/page-spy-wechat@latest`,
          lang: 'bash',
        },
        {
          title: t('inject.mp-wechat.request-host'),
          code: `https://${window.location.host}\nwss://${window.location.host}`,
        },
        {
          title: (
            <Trans i18nKey="inject.mp-wechat.init-sdk">
              <span>slot-0</span>
              <a
                href="https://github.com/HuolalaTech/page-spy/tree/main/packages/page-spy-wechat"
                target="_blank"
              >
                slot-1
              </a>
            </Trans>
          ),
          code: `import PageSpy from '@huolala-tech/page-spy-wechat';\n\nnew PageSpy({
  api: '${deployPath}',
})`,
          lang: 'js',
        },
      ],
      'mp-uniapp': [
        {
          title: t('inject.mp-uniapp.install-sdk'),
          code: `yarn add @huolala-tech/page-spy-uniapp@latest`,
          lang: 'bash',
        },
        {
          title: t('inject.mp-wechat.request-host'),
          code: `https://${window.location.host}\nwss://${window.location.host}`,
        },
        {
          title: (
            <Trans i18nKey="inject.mp-uniapp.init-sdk">
              <span>slot-0</span>
              <a
                href="https://github.com/HuolalaTech/page-spy/tree/main/packages/page-spy-uniapp"
                target="_blank"
              >
                slot-1
              </a>
            </Trans>
          ),
          code: `import PageSpy from '@huolala-tech/page-spy-uniapp';\n\nnew PageSpy({
  api: '${deployPath}',
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
  }, [deployPath, onCloseModal, platform, t]);

  return (
    <div className="platform-integratio">
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
