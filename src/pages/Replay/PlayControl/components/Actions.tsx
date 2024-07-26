import { useReplayStore, TIME_MODE } from '@/store/replay';
import Icon from '@ant-design/icons';
import { Space, Select, Tooltip } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { ReactComponent as PlaySvg } from '@/assets/image/play.svg';
import { ReactComponent as PauseSvg } from '@/assets/image/pause.svg';
import { ReactComponent as RelateTimeSvg } from '@/assets/image/related-time.svg';
import { ReactComponent as AbsoluteTimeSvg } from '@/assets/image/absolute-time.svg';

export const Actions = memo(() => {
  const { t } = useTranslation();
  const [
    setProgress,
    timeMode,
    setTimeMode,
    speed,
    setSpeed,
    isPlaying,
    setIsPlaying,
  ] = useReplayStore(
    useShallow((state) => [
      state.setProgress,
      state.timeMode,
      state.setTimeMode,
      state.speed,
      state.setSpeed,
      state.isPlaying,
      state.setIsPlaying,
    ]),
  );

  const isRelatedTimeMode = useMemo(() => {
    return timeMode === TIME_MODE.RELATED;
  }, [timeMode]);

  return (
    <div className="play-actions">
      <Space>
        <Icon
          component={isPlaying ? PauseSvg : PlaySvg}
          className="play-action__btn toggle-play-status"
          onClick={() => {
            const { progress } = useReplayStore.getState();
            if (!isPlaying && progress >= 1) {
              setProgress(0);
              setIsPlaying(true);
              return;
            }
            setIsPlaying(!isPlaying);
          }}
        />
      </Space>
      <Space size="small" className="right-actions">
        <Select
          size="middle"
          variant="borderless"
          defaultValue={speed}
          placeholder={t('replay.speed')}
          style={{ width: 65 }}
          suffixIcon={null}
          options={[
            { label: '0.5x', value: 0.5 },
            { label: '1.0x', value: 1 },
            { label: '2.0x', value: 2 },
            { label: '3.0x', value: 3 },
            { label: '4.0x', value: 4 },
          ]}
          onChange={setSpeed}
        />
        <Tooltip
          title={
            isRelatedTimeMode
              ? t('replay.related-time')
              : t('replay.absolute-time')
          }
        >
          <Icon
            component={isRelatedTimeMode ? RelateTimeSvg : AbsoluteTimeSvg}
            className="play-action__btn"
            onClick={() => {
              setTimeMode(
                isRelatedTimeMode ? TIME_MODE.ABSOLUTE : TIME_MODE.RELATED,
              );
            }}
          />
        </Tooltip>
      </Space>
    </div>
  );
});
