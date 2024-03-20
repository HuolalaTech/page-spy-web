import useSearch from '@/utils/useSearch';
import { message, Row, Col } from 'antd';
import './index.less';
import { useRequest } from 'ahooks';
import { LoadingFallback } from '@/components/LoadingFallback';
import { PlayControl } from './PlayControl';
import { strToU8, unzlibSync, strFromU8 } from 'fflate';
import { HarborDataItem, useReplayStore } from '@/store/replay';
import { RRWebPlayer } from './RRWebPlayer';
import { PluginPanel } from './PluginPanel';
import '@huolala-tech/react-json-view/dist/style.css';
import { useTranslation } from 'react-i18next';
import { InvalidObjectURL } from './InvalidObjectURL';

export const Replay = () => {
  const { t } = useTranslation();
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
    return <InvalidObjectURL />;
  }

  if (!duration) {
    message.error('Empty data');
    return <InvalidObjectURL />;
  }

  return (
    <div className="replay">
      <Row className="replay-header" justify="start">
        <Col>
          <span className="replay-header__title">{t('replay.title')}</span>
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
      <div className="replay-footer">
        <PlayControl />
      </div>
    </div>
  );
};
