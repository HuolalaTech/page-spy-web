import OSpy from '@huolala-tech/page-spy-plugin-ospy';
import '@huolala-tech/page-spy-plugin-ospy/dist/index.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';
import { useInViewport } from 'ahooks';
import { Config } from '@huolala-tech/page-spy-plugin-ospy/dist/types/config';
import { useTranslation } from 'react-i18next';
import { isCN } from '@/assets/locales';

type Theme = Pick<Config, 'title' | 'logo' | 'primaryColor'>;
const THEMES: Theme[] = [
  {
    title: 'O-Spy',
    logo: 'https://static.huolala.cn/image/21f7b74da110ab5c05d5366763c2efc30e3174fb.png',
    primaryColor: '#8434E9',
  },
  {
    title: 'Huolala',
    logo: 'https://static.huolala.cn/image/b9d3a2facbd188056c2a3e5cb3ebc749023fbfbe.png',
    primaryColor: '#f60',
  },
  {
    title: 'BugZap',
    logo: 'https://static.huolala.cn/image/6d7315a89a653f8b4d6c29d2c759491d21854788.png',
    primaryColor: '#328e17',
  },
  {
    title: 'DebugX',
    logo: 'https://static.huolala.cn/image/2ae2e7034b6f7775882953e708fb2351d2cbc690.png',
    primaryColor: '#d732d2',
  },
];

export const CustomizeExample = () => {
  const { t } = useTranslation();
  const $oSpy = useRef<OSpy | null>(null);
  useEffect(() => {
    $oSpy.current = new OSpy({
      lang: isCN() ? 'zh' : 'en',
    });
    return () => {
      $oSpy.current?.abort();
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const [inView] = useInViewport(ref);

  const [themeIndex, setThemeIndex] = useState(0);
  const theme = useMemo(() => THEMES[themeIndex], [themeIndex]);
  const code = useMemo(() => {
    if (themeIndex === 0)
      return `// ${t('oSpy.comment-default-params')}
new OSpy();`;

    return `new OSpy(${JSON.stringify(
      { ...theme, autoRender: true },
      null,
      2,
    )})`;
  }, [t, theme, themeIndex]);
  useEffect(() => {
    const { root } = $oSpy.current || {};

    if (!root) return;
    if (!inView) {
      root.style.visibility = 'hidden';
    } else {
      root.style.visibility = 'visible';
    }

    const floatLogo = root.querySelector(
      '[class^="_float"] img',
    ) as HTMLImageElement;
    const floatTitle = root.querySelector(
      '[class^="_float"] span',
    ) as HTMLSpanElement;
    const modalLogo = root.querySelector(
      '[class^="_headerLeft"] img',
    ) as HTMLImageElement;
    const modalTitle = root.querySelector(
      '[class^="_headerLeft"] [class^="_title"] b',
    ) as HTMLElement;

    if (theme) {
      const { primaryColor, logo, title } = theme;
      root.style.setProperty('--primary-color', primaryColor);
      if (floatLogo && floatTitle) {
        floatLogo.src = logo;
        floatTitle.textContent = title;
      }
      if (modalLogo && modalTitle) {
        modalLogo.src = logo;
        modalTitle.textContent = title;
      }
    }
  }, [inView, theme]);

  return (
    <div className="examples" ref={ref}>
      <div className="examples-wrapper">
        {THEMES.map((t, index) => {
          const active = themeIndex === index;
          return (
            <div
              key={index}
              className="example-item"
              style={{
                color: active ? t.primaryColor : '#fff',
                borderColor: active ? t.primaryColor : 'transparent',
              }}
              onClick={() => setThemeIndex(index)}
            >
              <img src={t.logo} />
              <b>{t.title}</b>
            </div>
          );
        })}
      </div>
      <CodeBlock code={code} lang="js" />
    </div>
  );
};
