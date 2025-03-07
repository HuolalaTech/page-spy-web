import { LoadingFallback } from '@/components/LoadingFallback';
import { getOriginFragments } from '@/utils/parseError';
import { useEventListener } from '@/utils/useEventListener';
import { AimOutlined, FrownOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import {
  Button,
  Col,
  Drawer,
  Result,
  Row,
  message,
  Typography,
  Empty,
  Select,
  Flex,
  Tooltip,
} from 'antd';
import clsx from 'clsx';
import { memo, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import './index.less';
import { BlockTitle } from '@/components/BlockTitle';

const { Paragraph, Text } = Typography;

export type RequiredFrames = Required<StackFrame>[];

const TAB_SIZE = [2, 4, 6, 8];

const ErrorStackItem = ({ frame }: { frame: Required<StackFrame> }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'console.error-trace',
  });
  const [tabSize, setTabSize] = useState(2);
  const {
    data,
    run: requestChunk,
    error,
    loading,
  } = useRequest(
    async () => {
      return getOriginFragments(frame);
    },
    {
      manual: true,
      onError(e) {
        message.error(e.message);
      },
    },
  );

  const stackFilename = useMemo(() => {
    return `${frame.fileName}(${frame.lineNumber}:${frame.columnNumber})`;
  }, [frame]);

  const content = useMemo(() => {
    if (loading) {
      return <LoadingFallback />;
    }
    if (error) {
      return (
        <Result
          icon={<FrownOutlined style={{ color: '#F79327', fontSize: 50 }} />}
          title={t('failed-title')}
        >
          <div>
            <Paragraph>
              <Text strong style={{ fontSize: 16 }}>
                {t('failed-advice')}
              </Text>
            </Paragraph>
            <Paragraph>
              <Trans i18nKey="console.error-trace.fix-suggestion-1">
                <Text>slot-0</Text>
                <code>slot-1</code>
                <Text>slot-2</Text>
              </Trans>
            </Paragraph>
            <Paragraph>
              <Text>{t('fix-suggestion-2')}</Text>
            </Paragraph>
          </div>
        </Result>
      );
    }

    if (!data?.highlightedHTML) {
      return null;
    }

    return (
      <div className="source-code-fragments">
        <Row
          className="fragments-header"
          justify="space-between"
          align="middle"
          wrap={false}
        >
          <Col className="origin-filename">
            <code>
              <span>{t('source-filename')}: </span>
              <span>
                {data.source}({data.line}:{data.column})
              </span>
            </code>
          </Col>
          {data.useTabs && (
            <Select
              size="small"
              value={tabSize}
              onChange={setTabSize}
              popupMatchSelectWidth
              options={TAB_SIZE.map((size) => ({
                label: `\\t = ${size} Space`,
                value: size,
              }))}
            />
          )}
        </Row>
        <div
          style={{
            // @ts-ignore
            '--start': data.start,
            '--error-line': data.line,
          }}
          dangerouslySetInnerHTML={{
            __html:
              data.highlightedHTML.replace(/\t/g, ' '.repeat(tabSize)) || '',
          }}
        />
      </div>
    );
  }, [data, error, loading, t, tabSize]);

  return (
    <div className="error-stack-item">
      <Flex gap={12} align="center" className="stack-filename" wrap={false}>
        <Tooltip title={stackFilename}>
          <code>{stackFilename}</code>
        </Tooltip>
        <AimOutlined
          className={clsx('locate-icon', {
            loading,
          })}
          onClick={requestChunk}
        />
      </Flex>
      {content}
    </div>
  );
};

export const ErrorDetailDrawer = memo(() => {
  const { t: ct } = useTranslation();
  const { t } = useTranslation('translation', {
    keyPrefix: 'console.error-trace',
  });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const errorMessage = useMemo(() => {
    if (error) {
      return [error.name, error.message].every((i) => error.stack?.includes(i))
        ? error.stack
        : `${error.name}: ${error.message}\n${error.stack}`;
    }
    return '';
  }, [error]);
  const [frames, setFrames] = useState<RequiredFrames>([]);

  useEventListener('source-code-detail', (evt) => {
    const { detail } = evt as CustomEvent;
    setOpen(true);
    setError(detail.error);
    setFrames(detail.frames);
  });

  return (
    <Drawer
      width="50%"
      open={open}
      destroyOnClose
      onClose={() => setOpen(false)}
      title={t('title')}
      className="error-detail-drawer"
      footer={
        <Row justify="end">
          <Col>
            <Button
              type="primary"
              onClick={() => {
                setOpen(false);
              }}
            >
              {ct('common.OK')}
            </Button>
          </Col>
        </Row>
      }
    >
      <BlockTitle title={t('message-title')} />
      {errorMessage ? (
        <div className="error-message-box">
          <pre>
            <code>{errorMessage}</code>
          </pre>
        </div>
      ) : (
        <Empty description={false} />
      )}
      <BlockTitle title={t('stack-title')} />
      {frames?.map((f, index) => (
        <ErrorStackItem key={f.fileName + index} frame={f} />
      ))}
    </Drawer>
  );
});
