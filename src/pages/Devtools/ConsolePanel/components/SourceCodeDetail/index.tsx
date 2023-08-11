import { getOriginFragments } from '@/utils/parseError';
import { useEventListener } from '@/utils/useEventListener';
import { withPopup } from '@/utils/withPopup';
import { useRequest } from 'ahooks';
import { Button, Col, Drawer, Row, message } from 'antd';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type RequiredFrames = Required<StackFrame>[];

const StackDetailItem = ({ frame }: { frame: Required<StackFrame> }) => {
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
      onSuccess(res) {
        console.log(res);
      },
    },
  );

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

export const SourceCodeDetail = memo(() => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<RequiredFrames>([]);

  useEventListener('source-code-detail', (evt) => {
    const { detail } = evt as CustomEvent;
    setOpen(true);
    setParams(detail.frames);
  });

  return (
    <Drawer
      width="50%"
      open={open}
      onClose={() => setOpen(false)}
      title={t('console.error-trace.title')}
      footer={
        <Row justify="end">
          <Col>
            <Button
              type="primary"
              onClick={() => {
                setOpen(false);
              }}
            >
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
});
