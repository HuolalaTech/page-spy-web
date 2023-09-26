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
} from 'antd';
import clsx from 'clsx';
import { memo, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import './index.less';
import { BlockTitle } from '@/components/BlockTitle';

const { Paragraph, Text } = Typography;

export type RequiredFrames = Required<StackFrame>[];

const ErrorStackItem = ({ frame }: { frame: Required<StackFrame> }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'console.error-trace',
  });
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
    if (!data?.sourceHTML) {
      return null;
    }

    return (
      <div className="source-code-fragments">
        <code className="origin-filename">
          <span>{t('source-filename')}:</span> {data.sourceFile}({data.line}:
          {data.column})
        </code>
        <div
          style={{
            // @ts-ignore
            '--start': data.start,
            '--error-line': data.line,
          }}
          dangerouslySetInnerHTML={{ __html: data.sourceHTML || '' }}
        />
      </div>
    );
  }, [data, error, loading, t]);

  return (
    <div className="error-stack-item">
      <Row
        align="middle"
        gutter={12}
        style={{
          marginBottom: 12,
        }}
      >
        <Col>
          <code className="stack-filename">{frame.fileName}</code>
        </Col>
        <Col>
          <AimOutlined
            className={clsx('locate-icon', {
              loading,
            })}
            onClick={requestChunk}
          />
        </Col>
      </Row>
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
      {error ? (
        <div className="error-message-box">
          <pre>
            <code>{error.stack}</code>
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
