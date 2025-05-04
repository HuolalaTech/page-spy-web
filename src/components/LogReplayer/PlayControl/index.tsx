import './index.less';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { fixProgress, useReplayStore } from '@/store/replay';
import { useEventListener } from '@/utils/useEventListener';
import { CurrentTime } from './components/CurrentTime';
import { ProgressBar } from './components/ProgressBar';
import { Actions } from './components/Actions';
import { Duration } from './components/Duration';
import { useShallow } from 'zustand/react/shallow';
import { throttle } from 'lodash-es';
import { REPLAY_PROGRESS_SKIP } from '../events';
import { Flex } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';

// 定义收缩状态变化事件名称
export const CONTROL_COLLAPSE_EVENT = 'control-collapse-change';

export const PlayControl = memo(() => {
  const [duration, speed, isPlaying, setIsPlaying, setProgress] =
    useReplayStore(
      useShallow((state) => [
        state.duration,
        state.speed,
        state.isPlaying,
        state.setIsPlaying,
        state.setProgress,
      ]),
    );
  
  // 添加响应式状态，用于检测屏幕宽度
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // 添加收缩状态
  const [collapsed, setCollapsed] = useState(false);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 切换收缩状态
  const toggleCollapsed = useCallback(() => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    
    // 触发自定义事件通知父组件
    window.dispatchEvent(
      new CustomEvent(CONTROL_COLLAPSE_EVENT, {
        detail: { collapsed: newCollapsed },
      })
    );
  }, [collapsed]);

  useEventListener(
    'keyup',
    (evt) => {
      const { key } = evt as KeyboardEvent;
      if (key === ' ') {
        setIsPlaying(!isPlaying);
      }
    },
    { target: document },
  );
  const flushActiveData = useRef(
    throttle(useReplayStore.getState().flushActiveData, 100),
  );
  const elapsed = useRef(0);
  const raf = useRef(0);

  useEventListener(REPLAY_PROGRESS_SKIP, () => {
    const { progress, duration } = useReplayStore.getState();
    elapsed.current = progress * duration;
    flushActiveData.current();
  });

  const rafHandler = useCallback(() => {
    if (!duration) return;
    elapsed.current = elapsed.current + 16 * speed;

    const progress = fixProgress(elapsed.current / duration);
    setProgress(progress);
    if (progress === 1) {
      setIsPlaying(false);
    }
    flushActiveData.current();

    if (progress < 1 && isPlaying) {
      raf.current = requestAnimationFrame(rafHandler);
    }
  }, [duration, isPlaying, setIsPlaying, setProgress, speed]);

  useEffect(() => {
    const { progress, duration } = useReplayStore.getState();
    elapsed.current = progress * duration;

    if (isPlaying) {
      raf.current = requestAnimationFrame(rafHandler);
    } else {
      window.cancelAnimationFrame(raf.current);
    }
    return () => {
      window.cancelAnimationFrame(raf.current);
    };
  }, [rafHandler, isPlaying]);

  return (
    <Flex vertical align="center" className={`play-control ${isMobile && collapsed ? 'play-control--collapsed' : ''}`} gap={0}>
      {isMobile && (
        <div className="collapse-toggle" onClick={toggleCollapsed}>
          {collapsed ? <CaretUpOutlined className="collapse-icon" /> : <CaretDownOutlined className="collapse-icon" />}
        </div>
      )}
      {(!isMobile || !collapsed) && (
        <>
          <Actions isMobile={isMobile} />
          <Flex 
            justify="center" 
            align="center" 
            gap={isMobile ? 10 : 18} 
            className="play-progress"
            wrap={isMobile ? "wrap" : "nowrap"}
          >
            <CurrentTime />
            <ProgressBar />
            <Duration />
          </Flex>
        </>
      )}
    </Flex>
  );
});
