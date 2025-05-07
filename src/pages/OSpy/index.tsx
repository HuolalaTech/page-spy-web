import './index.less';
import { Welcome } from './components/Welcome';
import { Replayer } from './components/Replayer';
import useSearch from '@/utils/useSearch';
import { has } from 'lodash-es';
import { useEffect, useState } from 'react';

export const OSpy = () => {
  const search = useSearch();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // 监听全屏状态变化事件
  useEffect(() => {
    const handleFullscreenChange = (e: CustomEvent) => {
      setIsFullscreen(e.detail.isFullscreen);
    };

    window.addEventListener(
      'fullscreen-change',
      handleFullscreenChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        'fullscreen-change',
        handleFullscreenChange as EventListener,
      );
    };
  }, []);

  return (
    <div className={`o-spy ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {has(search, 'url') ? <Replayer /> : <Welcome />}
    </div>
  );
};
