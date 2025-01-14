import { Flex, Space } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';
import './index.less';
import { CodeBlock } from '@/components/CodeBlock';
import JsDelivrSvg from '@/assets/image/jsdelivr.svg?react';
import UnpkgSvg from '@/assets/image/unpkg.svg?react';
import Icon from '@ant-design/icons';

const INIT_CODE = `const $feedback = new WholeBundle({
  title?: string; // 悬浮球和弹窗上显示的标题
  logo?: string; // Logo 的图片路径
  primaryColor?: string; // 定制主题色
  autoRender?: boolean; // 默认渲染悬浮球，设置为 false 后可调用 $feedback.open() 打开弹窗
})`;
const methods = [
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
  src="https://cdn.jsdelivr.net/npm/@huolala-tech/page-spy-plugin-whole-bundle/dist/iife/index.min.js"
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
            code: `<script src="https://unpkg.com/@huolala-tech/page-spy-plugin-whole-bundle/dist/iife/index.min.js" crossorigin="anonymous"></script>

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
        <h5>首先安装依赖：</h5>
        <CodeBlock
          lang="bash"
          code="yarn add @huolala-tech/page-spy-plugin-whole-bundle"
        />
        <h5>接着实例化：</h5>
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

export const ImportPackage = () => {
  const [active, setActive] = useState<string>(methods[0].title);
  const activeMethod = methods.find((i) => i.title === active);
  return (
    <Flex
      vertical
      justify="center"
      align="center"
      gap={24}
      className="import-package"
    >
      <h1 style={{ textAlign: 'center' }}>随心选择引入方式</h1>
      <h5>与框架无关，你可以任选一种方式在项目中引入</h5>
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
      <div className="import-code">{activeMethod?.code}</div>
    </Flex>
  );
};
