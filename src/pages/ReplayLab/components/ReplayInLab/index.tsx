import { LogReplayer } from '@/components/LogReplayer';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import './index.less';
import { Button, Flex, Popover, Space, Upload, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import Icon, {
  ArrowLeftOutlined,
  FileSearchOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { useStepStore } from '../store';
import { useThreshold } from '@/utils/useThreshold';
import { useShallow } from 'zustand/react/shallow';
import { CodeBlock } from '@/components/CodeBlock';
import JsDelivrSvg from '@/assets/image/jsdelivr.svg?react';
import UnpkgSvg from '@/assets/image/unpkg.svg?react';
import { Link } from 'react-router-dom';

const ImportGuide = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'lab' });
  const methods = useMemo(() => {
    const INIT_CODE = `const $feedback = new WholeBundle({
  title?: string; // ${t('comment-title')}
  logo?: string; // ${t('comment-logo')}
  primaryColor?: string; // ${t('comment-primaryColor')}
  autoRender?: boolean; // ${t('comment-autoRender')}
})`;

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
                code: `<script src="https://cdn.jsdelivr.net/npm/@huolala-tech/page-spy-plugin-whole-bundle" crossorigin="anonymous"></script>

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
                code: `<script src="https://unpkg.com/@huolala-tech/page-spy-plugin-whole-bundle" crossorigin="anonymous"></script>

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
            <h5>{t('install-1st')}</h5>
            <CodeBlock
              lang="bash"
              code="yarn add @huolala-tech/page-spy-plugin-whole-bundle"
            />
            <h5>{t('install-2nd')}</h5>
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
      <div className="import-code">{activeMethod?.code}</div>
    </div>
  );
};

export const ReplayInLab = () => {
  const { t } = useTranslation();
  const isMobile = useThreshold();
  const [prev, replayUrl, setReplayUrl] = useStepStore(
    useShallow((state) => [state.prev, state.replayUrl, state.setReplayUrl]),
  );
  const uploadCustomRequest: UploadProps['customRequest'] = (file) => {
    const blob = URL.createObjectURL(file.file as File);
    setReplayUrl(blob);
    return null;
  };
  const reusableButtons = useMemo(() => {
    return (
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={prev}>
          {t('common.back')}
        </Button>
        <Popover content={ImportGuide} placement="bottomLeft" trigger="click">
          <Button icon={<ReadOutlined />}>{t('lab.import-use')}</Button>
        </Popover>
        <Upload
          accept=".json"
          maxCount={1}
          customRequest={uploadCustomRequest}
          itemRender={() => null}
        >
          <Button type="primary" icon={<FileSearchOutlined />}>
            {t('replay.select-log')}
          </Button>
        </Upload>
      </Space>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, t]);
  if (isMobile) {
    return (
      <Flex
        vertical
        justify="center"
        align="center"
        style={{ height: '100%', paddingInline: 20 }}
        gap={24}
      >
        <h2>{t('lab.only-pc')}</h2>
        <Button icon={<ArrowLeftOutlined />} onClick={prev}>
          {t('common.back')}
        </Button>
      </Flex>
    );
  }
  return (
    <div className="replay-in-lab">
      <div className="replay-container">
        <LogReplayer url={replayUrl} backSlot={reusableButtons} />
      </div>
    </div>
  );
};
