import { ReactComponent as WebSvg } from '@/assets/image/web-h5.svg';
import { ReactComponent as MiniprogramSvg } from '@/assets/image/miniprogram.svg';
import { ReactNode, useMemo, type ComponentType } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Lang } from 'shiki';
import { CodeBlock } from '@/components/CodeBlock';

export type PlatformName = 'web' | 'miniprogram';

export const PLATFORMS: { name: PlatformName; icon: ComponentType }[] = [
  {
    name: 'web',
    icon: WebSvg,
  },
  {
    name: 'miniprogram',
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
          code: `<script crossorigin="anonymous" src="${window.location.origin}/page-spy/index.min.js"></script>`,
        },
        {
          title: (
            <Trans i18nKey="inject.web.init-sdk">
              <span>slot-0</span>
              <a
                href="https://github.com/HuolalaTech/page-spy?tab=readme-ov-file#web"
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
      miniprogram: [
        {
          title: t('inject.miniprogram.install-sdk'),
          code: `yarn add @huolala-tech/page-spy`,
          lang: 'bash',
        },
        {
          title: t('inject.miniprogram.request-host'),
          code: `https://${window.location.host}\nwss://${window.location.host}`,
        },
        {
          title: (
            <Trans i18nKey="inject.miniprogram.init-sdk">
              <span>slot-0</span>
              <a
                href="https://github.com/HuolalaTech/page-spy?tab=readme-ov-file#mini-program"
                target="_blank"
              >
                slot-1
              </a>
            </Trans>
          ),
          code: `import PageSpy from '@huolala-tech/page-spy/dist/miniprogram/esm.min.js';\nnew PageSpy({
  api: '${window.location.host}',
})`,
          lang: 'js',
        },
        {
          title: t('inject.miniprogram.init-sdk-native'),
          code: `import PageSpy from './your/path/page-spy.js';\nnew PageSpy({
  api: '${window.location.host}',
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
