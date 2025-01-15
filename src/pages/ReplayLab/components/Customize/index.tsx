import WholeBundle, {
  Config,
} from '@huolala-tech/page-spy-plugin-whole-bundle';
import '@huolala-tech/page-spy-plugin-whole-bundle/dist/index.css';
import { Flex, Button, Row, Col } from 'antd';
import { useEffect, useRef, useState } from 'react';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';
import { Trans, useTranslation } from 'react-i18next';

type Theme = Omit<Config, 'autoRender'>;
const THEMES: Theme[] = [
  {
    primaryColor: 'red',
    title: '问题反馈',
    logo: 'https://static.huolala.cn/image/783a566204f23cebb56cd3759954c9590f478aaa.png',
  },
  {
    primaryColor: '#f60',
    title: '货拉拉',
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
  {
    primaryColor: '#468bed',
    title: '強力殺虫',
    logo: 'https://static.huolala.cn/image/d76e7d734ecb1b21b7e68f907b43cbf2ea06d3e4.png',
  },
  {
    primaryColor: '#FB9D22',
    title: '故障排查',
    logo: 'https://static.huolala.cn/image/4b469ad461600b0ed519809947dc2d8edf092000.png',
  },
];

const translations = [
  '你好，我是 PageSpy。当前时间：', // 中文 (简体中文)
  'Hello, I am PageSpy. Current time:', // 英语 (English)
  'Hola, soy PageSpy. Hora actual:', // 西班牙语 (Español)
  'Bonjour, je suis PageSpy. Heure actuelle :', // 法语 (Français)
  'Hallo, ich bin PageSpy. Aktuelle Uhrzeit:', // 德语 (Deutsch)
  'Olá, eu sou o PageSpy. Hora atual:', // 葡萄牙语 (Português)
  'Привет, я PageSpy. Текущее время:', // 俄语 (Русский)
  'مرحبًا، أنا PageSpy. الوقت الحالي:', // 阿拉伯语 (العربية)
];
export const Customize = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'lab' });
  const [themeIndex, setThemeIndex] = useState(0);
  const consoleTimer = useRef<number | null>(null);
  useEffect(() => {
    const $feedback = new WholeBundle();
    return () => {
      $feedback.abort();
    };
  }, []);
  useEffect(() => {
    const theme = THEMES[themeIndex];
    const root = document.querySelector(
      '#page-spy-feedback-root',
    ) as HTMLDivElement;
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
  }, [themeIndex]);
  useEffect(() => {
    let index = 0;
    const { length } = translations;
    consoleTimer.current = setInterval(() => {
      console.log(
        `${translations[index++ % length]} ${new Date().toLocaleString()}`,
      );
    }, 1000);
    return () => {
      if (consoleTimer.current) {
        clearInterval(consoleTimer.current);
        consoleTimer.current = null;
      }
    };
  }, []);

  return (
    <div className="customize">
      <div className="customize-left">
        <h1>{t('customize-lTitle')}</h1>
        <h5 style={{ textAlign: 'center' }}>{t('customize-lDesc')}</h5>
        <div className="examples">
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
            code={`new WholeBundle(${JSON.stringify(
              { ...THEMES[themeIndex], autoRender: true },
              null,
              2,
            )})`}
            lang="js"
          />
        </div>
      </div>
      <div className="customize-right">
        <h1>{t('customize-rTitle')}</h1>
        <h5 style={{ letterSpacing: 0.5 }}>
          <Trans i18nKey="lab.customize-rDesc">
            一切准备就绪！点开右下方渲染的控件看看。
            <br />
            在弹窗中试着输入备注信息、并导出日志，
            <br />
            稍后我将带你
            <u style={{ textUnderlineOffset: 5, fontStyle: 'italic' }}>
              查看你自己的操作回放
            </u>
            ！
          </Trans>
        </h5>
      </div>
    </div>
  );
};
