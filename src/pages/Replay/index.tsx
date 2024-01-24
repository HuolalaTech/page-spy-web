import useSearch from '@/utils/useSearch';
import { Empty, message, Row, Col } from 'antd';
import './index.less';
import { useRequest } from 'ahooks';
import { LoadingFallback } from '@/components/LoadingFallback';
import { PlayControl } from './PlayControl';
import { strToU8, unzlibSync, strFromU8 } from 'fflate';
import { HarborDataItem, useReplayStore } from '@/store/replay';
import { RRWebPlayer } from './RRWebPlayer';
import { PluginPanel } from './PluginPanel';
import '@huolala-tech/react-json-view/dist/style.css';

export const Replay = () => {
  const { url } = useSearch();
  const setAllData = useReplayStore((state) => state.setAllData);
  const { loading, error } = useRequest(async () => {
    if (!url) return null;
    const res = await (await fetch(url)).json();
    const result = res.map((i: any) => {
      i.data = JSON.parse(strFromU8(unzlibSync(strToU8(i.data, true))));
      return i;
    }) as HarborDataItem[];
    setAllData(result);
    return result;
  });
  const [duration, allRRwebEvent] = useReplayStore((state) => [
    state.duration,
    state.allRRwebEvent,
  ]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    message.error(error.message);
    return <Empty />;
  }

  if (!duration) {
    message.error('Empty data');
    return <Empty />;
  }

  return (
    <div className="replay">
      <Row className="replay-header" justify="start">
        <Col>
          <span className="replay-header__title">Replay</span>
        </Col>
      </Row>
      <Row align="stretch" className="replay-main" gutter={24}>
        {!!allRRwebEvent.length && (
          <Col className="replay-main__left">
            <RRWebPlayer />
          </Col>
        )}
        <Col flex="1" className="replay-main__right">
          <PluginPanel />
        </Col>
      </Row>
      <Row justify="center" className="replay-footer">
        <Col flex="60% 0 0">
          <PlayControl duration={duration} />
        </Col>
      </Row>
    </div>
  );
};
