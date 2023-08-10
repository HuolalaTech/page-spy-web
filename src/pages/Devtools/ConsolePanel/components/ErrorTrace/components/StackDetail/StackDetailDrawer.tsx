import { withPopup } from '@/utils/withPopup';
import { useRequest } from 'ahooks';
import { Button, Col, Drawer, Row, message } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type RequiredFrames = Required<StackFrame>[];

const readFile = async (url: string) => {
  if (!url.trim()) return null;
  return await (await fetch(url)).text();
};

const StackDetailItem = ({ frame }: { frame: Required<StackFrame> }) => {
  const { t } = useTranslation('console.error-drawer');
  const {
    data,
    run: requestChunk,
    error,
    loading,
  } = useRequest(
    async () => {
      const minified = await readFile(frame.fileName);
      if (!minified) {
        throw new Error(t('fetch-minify-fail')!);
      }
      const sourceMapUrl = minified.match(/(?<=\/\/#\s+sourceMappingURL=).*/);
      if (!sourceMapUrl) {
        throw new Error(t('none-sourcemap')!);
      }
      const sourcemap = await readFile(
        new URL(sourceMapUrl[0], frame.fileName).toString(),
      );
      if (!sourcemap) {
        throw new Error(t('fetch-sourcemap-fail')!);
      }
      return {
        minified,
        sourcemap,
      };
    },
    {
      manual: true,
      onError(e) {
        message.error(e.message);
      },
    },
  );

  const result = useMemo(async () => {
    if (!data) return;
    const what = await window.sourceMap.SourceMapConsumer.with(
      data.sourcemap,
      null,
      (consumer) => {
        const { line, source } = consumer.originalPositionFor({
          line: frame.lineNumber,
          column: frame.columnNumber,
        });
        if (source === null || line === null) return;
        const start = Math.max(line - 5, 0);
        const end = line + 5;
        const contentList = consumer
          .sourceContentFor(source)
          ?.split('\n')
          .slice(start, end)
          .map((content, index) => {
            return {
              line: start + index + 1,
              content,
            };
          });
        console.log(contentList);
      },
    );
  }, [data]);

  return (
    <Row>
      <Col>{frame.fileName}</Col>
      <Col>
        <Button type="text" onClick={requestChunk}>
          fetch
        </Button>
      </Col>
    </Row>
  );
};

export const StackDetailDrawer = withPopup<RequiredFrames>(
  ({ visible, resolve, params }) => {
    const { t } = useTranslation();

    return (
      <Drawer
        width="50%"
        open={visible}
        onClose={resolve}
        title={t('console.error-drawer.title')}
        footer={
          <Row justify="end">
            <Col>
              <Button type="primary" onClick={resolve}>
                {t('common.OK')}
              </Button>
            </Col>
          </Row>
        }
      >
        {params?.map((f) => (
          <StackDetailItem key={f.fileName} frame={f} />
        ))}
      </Drawer>
    );
  },
);
