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
import { RefCallback, useCallback, useEffect, useRef, useState } from 'react';
import useCallbackRef from '@/utils/useCallbackRef';
import clsx from 'clsx';
import { PLAYER_SIZE_CHANGE } from './events';
import { useEventListener } from '@/utils/useEventListener';
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

  const setIsExpand = useReplayerExpand((state) => state.setIsExpand);
  const [isDragging, setIsDragging] = useState(false);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const bindPlayer = useCallback<RefCallback<HTMLDivElement>>((node) => {
    playerRef.current = node;
  }, []);
  const bindDragger = useCallbackRef<HTMLDivElement>((node) => {
    if (!node) return;
    const info = {
      touchX: 0,
      playerWidth: 0,
      playerMaxWidth: window.innerWidth * 0.8,
      playerMinWidth: window.innerWidth * 0.3,
    };
    const mousedown = (e: MouseEvent) => {
      if (!playerRef.current) return;
      const { clientX } = e;
      info.touchX = clientX;
      info.playerWidth = playerRef.current.getBoundingClientRect().width;

      setIsDragging(true);
      window.addEventListener('mousemove', mousemove);
      window.addEventListener('mouseup', mouseup);
    };
    const mousemove = (e: MouseEvent) => {
      const diff = e.clientX - info.touchX;
      const resultX = info.playerWidth + diff;
      if (resultX >= info.playerMinWidth && resultX <= info.playerMaxWidth) {
        playerRef.current!.style.flexBasis = `${resultX}px`;
      }
    };
    const mouseup = (e: MouseEvent) => {
      mousemove(e);
      info.touchX = 0;
      const { width } = playerRef.current!.getBoundingClientRect();
      if (width >= window.innerWidth * 0.6) {
        setIsExpand(true);
      } else {
        setIsExpand(false);
      }
      setIsDragging(false);
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
      window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
    };
    node.addEventListener('mousedown', mousedown);
    return () => {
      node.removeEventListener('mousedown', mousedown);
    };
  });
  useEventListener('resize', () => {
    window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
  });

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
      <div className="replay-main">
        {!!allRRwebEvent.length && (
          <>
            <div
              className={clsx('replay-main__left', isDragging && 'no-select')}
              ref={bindPlayer}
            >
              <RRWebPlayer />
            </div>
            <div className="replay-main__center">
              <div className="dragger" ref={bindDragger} />
            </div>
          </>
        )}
        <div className={clsx('replay-main__right', isDragging && 'no-select')}>
          <PluginPanel />
        </div>
      </div>
      <div className="replay-footer">
        <PlayControl />
      </div>
    </div>
  );
};
