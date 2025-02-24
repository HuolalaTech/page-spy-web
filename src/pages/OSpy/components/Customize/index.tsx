import OSpy, { Config } from '@huolala-tech/page-spy-plugin-ospy';
import '@huolala-tech/page-spy-plugin-ospy/dist/index.css';
import { useEffect, useRef, useState } from 'react';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';
import { useInViewport } from 'ahooks';

type Theme = Omit<Config, 'autoRender'>;
const THEMES: Theme[] = [
  {
    primaryColor: 'red',
    title: 'Feedback',
    logo: 'https://static.huolala.cn/image/783a566204f23cebb56cd3759954c9590f478aaa.png',
  },
  {
    primaryColor: '#f60',
    title: 'Huolala',
    logo: 'https://static.huolala.cn/image/b9d3a2facbd188056c2a3e5cb3ebc749023fbfbe.png',
  },
  {
    primaryColor: '#328e17',
    title: 'BugZap',
    logo: 'https://static.huolala.cn/image/6d7315a89a653f8b4d6c29d2c759491d21854788.png',
  },
  {
    primaryColor: '#d732d2',
    title: 'DebugX',
    logo: 'https://static.huolala.cn/image/2ae2e7034b6f7775882953e708fb2351d2cbc690.png',
  },
];

export const CustomizeExample = () => {
  useEffect(() => {
    const $feedback = new OSpy();
    return () => {
      $feedback.abort();
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const [inView] = useInViewport(ref);

  const [themeIndex, setThemeIndex] = useState(0);
  useEffect(() => {
    const theme = THEMES[themeIndex];
    const root = document.querySelector(
      '#page-spy-feedback-root',
    ) as HTMLDivElement;

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

    if (root && theme) {
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
  }, [inView, themeIndex]);

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
      <CodeBlock
        code={`new OSpy(${JSON.stringify(
          { ...THEMES[themeIndex], autoRender: true },
          null,
          2,
        )})`}
        lang="js"
      />
    </div>
  );
};
