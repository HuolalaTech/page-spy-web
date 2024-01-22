import useSearch from '@/utils/useSearch';
import { Empty, message, Row, Col } from 'antd';
import './index.less';
import { useEffect, useMemo } from 'react';
import { useRequest } from 'ahooks';
import { LoadingFallback } from '@/components/LoadingFallback';
import { useEventListener } from '@/utils/useEventListener';
import {
  PlayControl,
  REPLAY_END,
  REPLAY_PROGRESS_CHANGE,
  REPLAY_STATUS_CHANGE,
} from './PlayControl';

export const Replay = () => {
  const { url } = useSearch();
  const { data, loading, error } = useRequest(async () => {
    if (!url) return null;
    const res = await fetch(url);
    return res.json();
  });

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    message.error(error.message);
    return <Empty />;
  }

  if (!data) {
    message.error('Empty data');
    return <Empty />;
  }

  // useEventListener(REPLAY_STATUS_CHANGE, (evt) => {
  //   const status = (evt as CustomEvent).detail;
  //   console.log({ status });
  // });
  // useEventListener(REPLAY_PROGRESS_CHANGE, (evt) => {
  //   const progress = (evt as CustomEvent).detail;
  //   console.log({ progress });
  // });
  // useEventListener(REPLAY_END, (evt) => {
  //   console.log('end');
  // });

  return (
    <div className="replay">
      <Row align="stretch" gutter={24}>
        <Col className="rrweb-player">rrweb 播放器</Col>
        <Col flex="1" className="plugin-panel">
          日志、请求面板
        </Col>
      </Row>
      <Row justify="center">
        <Col flex="80% 0 0">
          <PlayControl duration={5000} />
        </Col>
      </Row>
    </div>
  );
};
