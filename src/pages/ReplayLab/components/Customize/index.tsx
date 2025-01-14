import WholeBundle, {
  Config,
} from '@huolala-tech/page-spy-plugin-whole-bundle';
import '@huolala-tech/page-spy-plugin-whole-bundle/dist/index.css';
import { Flex, Button, Row, Col } from 'antd';
import { useEffect, useRef, useState } from 'react';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';

type Theme = Omit<Config, 'autoRender'>;
const THEMES: Theme[] = [
  {
    primaryColor: 'red',
    title: '问题反馈',
    logo: 'https://i.imgur.com/swwCg9z.png',
  },
  {
    primaryColor: '#f60',
    title: '货拉拉',
    logo: 'https://i.imgur.com/CVLAXbn.png',
  },
  {
    primaryColor: '#328e17',
    title: 'BugZap',
    logo: 'https://i.imgur.com/Yop3Vqe.png',
  },
  {
    primaryColor: '#d732d2',
    title: 'DebugX',
    logo: 'https://i.imgur.com/nqOV2fs.png',
  },
  {
    primaryColor: '#468bed',
    title: '強力殺虫',
    logo: 'https://i.imgur.com/jOaAmSA.png',
  },
  {
    primaryColor: '#FB9D22',
    title: '故障排查',
    logo: 'https://i.imgur.com/h05kDdW.png',
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
        <h1>个性化</h1>
        <h5 style={{ textAlign: 'center' }}>
          主题色、LOGO、标题支持定制，下面是参考的案例
        </h5>
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
        <h1>初体验</h1>
        <h5 style={{ letterSpacing: 0.5 }}>
          一切准备就绪！点开右下方渲染的控件看看。
          <br />
          在弹窗中试着输入备注信息、并导出日志，
          <br />
          稍后我将带你{' '}
          <u style={{ textUnderlineOffset: 5, fontStyle: 'italic' }}>
            查看你自己的操作回放
          </u>{' '}
          ！
        </h5>
      </div>
    </div>
  );
};
