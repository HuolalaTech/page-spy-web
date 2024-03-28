import useSearch from '@/utils/useSearch';
import { message, Row, Col, Space } from 'antd';
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
import { Link } from 'react-router-dom';
import { ReactComponent as LeftArrowSvg } from '@/assets/image/left-arrow.svg';
import { useReplayerExpand } from '@/store/replayer-expand';

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

  const isExpand = useReplayerExpand((state) => state.isExpand);

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
          <Space>
            <Link to={{ pathname: '/log-list' }} className="back-list">
              <LeftArrowSvg style={{ fontSize: 18 }} />
            </Link>
            <span className="replay-header__title">{t('replay.title')}</span>
          </Space>
        </Col>
      </Row>
      <Row align="stretch" className="replay-main" gutter={24} wrap={false}>
        {!!allRRwebEvent.length && (
          <Col
            className="replay-main__left"
            style={{ width: isExpand ? '70vw' : '40vw' }}
          >
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
