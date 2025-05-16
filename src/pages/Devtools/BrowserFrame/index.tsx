import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useState } from 'react';
import Icon, { PicLeftOutlined, ReloadOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import CellularSVG from '@/assets/image/cellular.svg?react';
import BatterySVG from '@/assets/image/battery.svg?react';
import DeviceSVG from '@/assets/image/device.svg?react';
import './index.less';
import { Button, Space, Spin } from 'antd';
import { ElementPanel } from '../ElementPanel';
import { useTranslation } from 'react-i18next';
import { useSocketMessageStore } from '@/store/socket-message';
import { useShallow } from 'zustand/react/shallow';
import clsx from 'clsx';

// 定义屏幕方向锁定类型
type OrientationLockType = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

// 扩展屏幕方向API类型
interface ExtendedScreenOrientation extends ScreenOrientation {
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
}

interface ExtendedScreen extends Screen {
  orientation: ExtendedScreenOrientation;
}

// 检查屏幕方向API是否可用
const isScreenOrientationSupported = () => {
  return typeof window !== 'undefined' && 
    window.screen && 
    ('orientation' in window.screen) && 
    ('lock' in (window.screen as ExtendedScreen).orientation);
};

// 全屏状态改变事件名称
const FULLSCREEN_CHANGE_EVENT = 'page-fullscreen-change';

function getTime() {
  const date = new Date();
  let hours = String(date.getHours());
  hours = Number(hours) >= 10 ? hours : `0${hours}`;
  let mins = String(date.getMinutes());
  mins = Number(mins) >= 10 ? mins : `0${mins}`;
  return [hours, mins].join(':');
}

interface FrameWrapperProps {
  os?: 'iOS' | 'Android';
  loading: boolean;
  onRefresh: () => void;
}

export const PCFrame = ({
  children,
  loading,
  onRefresh,
}: PropsWithChildren<FrameWrapperProps>) => {
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
  const { t } = useTranslation('translation', { keyPrefix: 'page' });
  const [pageLocation, clientInfo] = useSocketMessageStore(
    useShallow((state) => [state.pageMsg.location, state.clientInfo]),
  );
  const [elementVisible, setElementVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const utilsRef = useRef<HTMLDivElement | null>(null);
  const xAxisRef = useRef(0);
  const [width, setWidth] = useState<string | number>('40%');
  // 检测是否为移动设备
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  const orientationLockRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const checkMobileDevice = () => {
      // 移动设备检测
      const mobileWidth = 768;
      setIsMobileDevice(window.innerWidth <= mobileWidth);
    };
    
    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    
    return () => {
      window.removeEventListener('resize', checkMobileDevice);
    };
  }, []);

  // 处理横屏锁定
  const lockScreenOrientation = useCallback(async (lock: boolean) => {
    if (!isScreenOrientationSupported() || !isMobileDevice) return;
    
    try {
      // 尝试使用屏幕方向API
      if (lock) {
        const orientation = (window.screen as ExtendedScreen).orientation;
        // 锁定为横屏
        try {
          orientationLockRef.current = orientation.lock('landscape');
          await orientationLockRef.current;
          console.log('屏幕已锁定为横屏模式');
        } catch (lockErr) {
          console.error('锁定横屏失败:', lockErr);
          // 失败时尝试其他横屏方向
          try {
            orientationLockRef.current = orientation.lock('landscape-primary');
            await orientationLockRef.current;
            console.log('屏幕已锁定为主横屏模式');
          } catch (altLockErr) {
            console.error('备用横屏锁定也失败:', altLockErr);
          }
        }
      } else if (orientationLockRef.current) {
        // 解锁屏幕方向
        try {
          const orientation = (window.screen as ExtendedScreen).orientation;
          orientation.unlock();
          orientationLockRef.current = null;
          console.log('屏幕方向已解锁');
        } catch (unlockErr) {
          console.error('解锁屏幕方向失败:', unlockErr);
        }
      }
    } catch (error) {
      console.error('屏幕方向操作失败:', error);
    }
  }, [isMobileDevice]);

  // 处理全屏切换
  const toggleFullscreen = useCallback(async () => {
    try {
      const newFullscreenState = !isFullscreen;
      setIsFullscreen(newFullscreenState);
      
      // 锁定/解锁屏幕方向
      await lockScreenOrientation(newFullscreenState);
      
      // 如果是移动设备，添加特殊处理
      if (newFullscreenState) {
        if (isMobileDevice) {
          // 尝试请求设备进入全屏模式
          try {
            if (document.documentElement.requestFullscreen) {
              await document.documentElement.requestFullscreen();
            }
          } catch (err) {
            console.error('全屏请求失败:', err);
          }
        }
      } else {
        // 退出全屏模式
        if (document.fullscreenElement && document.exitFullscreen) {
          try {
            await document.exitFullscreen();
          } catch (err) {
            console.error('退出全屏失败:', err);
          }
        }
      }
      
      // 派发全屏状态改变事件
      window.dispatchEvent(
        new CustomEvent(FULLSCREEN_CHANGE_EVENT, {
          detail: { isFullscreen: newFullscreenState },
        })
      );
    } catch (error) {
      console.error('全屏切换处理失败:', error);
      // 尝试恢复状态
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (e) {
          // 忽略额外错误
        }
      }
      
      // 确保在错误处理后也发送全屏状态事件
      window.dispatchEvent(
        new CustomEvent(FULLSCREEN_CHANGE_EVENT, {
          detail: { isFullscreen: false },
        })
      );
    }
  }, [isFullscreen, isMobileDevice, lockScreenOrientation]);

  // 监听系统全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFullscreen = !!document.fullscreenElement;
      if (isFullscreen !== isDocFullscreen) {
        setIsFullscreen(isDocFullscreen);
        
        // 如果是退出全屏，确保解锁屏幕方向
        if (!isDocFullscreen) {
          lockScreenOrientation(false);
        }
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, lockScreenOrientation]);

  // 组件卸载时清除资源
  useEffect(() => {
    return () => {
      // 确保退出全屏模式
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          document.exitFullscreen();
        } catch (error) {
          console.error('退出全屏失败:', error);
        }
      }
      
      // 确保解锁屏幕方向
      if (isScreenOrientationSupported()) {
        try {
          const orientation = (window.screen as ExtendedScreen).orientation;
          orientation.unlock();
        } catch (error) {
          console.error('解锁屏幕方向失败:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!elementVisible) {
      return;
    }
    const clientIframe = document.querySelector(
      '.client-iframe',
    ) as HTMLIFrameElement;
    const containerArea = containerRef.current;
    const dividerLine = dividerRef.current;
    const utilsArea = utilsRef.current;
    let rightWidth = 0;
    let containerWidth = 0;
    let MAX_SIZE = 0;
    let MIN_SIZE = 0;
    function start(e: MouseEvent) {
      e.preventDefault();
      // `mousemove` not working when meet iframe
      clientIframe.style.pointerEvents = 'none';
      containerWidth = containerArea?.getBoundingClientRect().width || 0;
      MAX_SIZE = containerWidth * 0.6;
      MIN_SIZE = containerWidth * 0.4;
      rightWidth = utilsArea?.getBoundingClientRect().width || 0;
      const { clientX } = e;
      xAxisRef.current = clientX;
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
    }
    function move(e: MouseEvent) {
      e.preventDefault();
      const { clientX } = e;
      const diffX = Number(
        (rightWidth - (clientX - xAxisRef.current)).toFixed(2),
      );
      if (diffX > MAX_SIZE || diffX < MIN_SIZE) return;
      setWidth(diffX);
    }
    function end() {
      xAxisRef.current = 0;
      // reset `pointEvents` when mouse up
      clientIframe.style.pointerEvents = 'auto';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
    }
    dividerLine?.addEventListener('mousedown', start);
    // eslint-disable-next-line consistent-return
    return () => {
      dividerLine?.removeEventListener('mousedown', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
    };
  }, [elementVisible]);

  const [enableDevice, setEnableDevice] = useState(false);

  useEffect(() => {
    if (!clientInfo) return;
    if (['ios', 'ipad', 'android'].indexOf(clientInfo.os.type) >= 0) {
      setEnableDevice(true);
      onRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientInfo]);

  return (
    <div className={clsx('pc-frame', isFullscreen && 'fullscreen', isFullscreen && isMobileDevice && 'force-landscape')} ref={containerRef}>
      <div className="pc-frame__top">
        <div className="pc-frame__top-left">
          <Space>
            <div className="function-circle close" />
            <div className="function-circle mini" />
            <div className="function-circle fullscreen" />
          </Space>
        </div>
        <div className="pc-frame__top-center" title={pageLocation?.href}>
          {pageLocation?.href || ''}
        </div>
        <div className="pc-frame__top-right">
          {!isMobileDevice ? (
            <Space>
              <Button
                type={elementVisible ? 'primary' : 'default'}
                icon={<PicLeftOutlined />}
                onClick={() => {
                  setElementVisible(!elementVisible);
                }}
              >
                {t('element')}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  if (loading) return;
                  onRefresh();
                }}
              >
                {ct('refresh')}
              </Button>
              <Button
                type={enableDevice ? 'primary' : 'default'}
                icon={<Icon component={DeviceSVG} style={{ fontSize: 14 }} />}
                onClick={() => {
                  setEnableDevice((state) => !state);
                  onRefresh();
                }}
              >
                {t('device')}
              </Button>
            </Space>
          ) : null}
        </div>
      </div>
      {isMobileDevice && !isFullscreen && (
        <div className="pc-frame__mobile-controls">
          <Button
            type={elementVisible ? 'primary' : 'default'}
            icon={<PicLeftOutlined />}
            onClick={() => {
              setElementVisible(!elementVisible);
            }}
          >
            {t('element')}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              if (loading) return;
              onRefresh();
            }}
          >
            {ct('refresh')}
          </Button>
          <Button
            type={enableDevice ? 'primary' : 'default'}
            icon={<Icon component={DeviceSVG} style={{ fontSize: 14 }} />}
            onClick={() => {
              setEnableDevice((state) => !state);
              onRefresh();
            }}
          >
            {t('device')}
          </Button>
          <Button
            type={isFullscreen ? 'primary' : 'default'}
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? t('exit_fullscreen') : t('fullscreen')}
          </Button>
        </div>
      )}
      <div className="pc-frame__body spin-container">
        <Spin spinning={loading} className="spin-controller" />
        {enableDevice ? (
          <div className={clsx('mobile-frame', isFullscreen && 'fullscreen')}>
            <div className="mobile-frame__body-content">{children}</div>
          </div>
        ) : (
          <div className={clsx('pc-frame__body-content', isFullscreen && 'fullscreen')}>{children}</div>
        )}
        {elementVisible && !isFullscreen && (
          <>
            <div className="pc-frame__body-divider" ref={dividerRef} />
            <div
              className="pc-frame__body-utils"
              ref={utilsRef}
              style={{ width }}
            >
              <div>
                <ElementPanel />
              </div>
            </div>
          </>
        )}

        {/* 全屏时显示的退出按钮 */}
        {isFullscreen && isMobileDevice && (
          <div className="fullscreen-exit-button" onClick={toggleFullscreen}>
            <FullscreenExitOutlined />
          </div>
        )}
      </div>
    </div>
  );
};

const IOSFrame = ({ children }: PropsWithChildren<unknown>) => {
  const time = getTime();
  const pageLocation = useSocketMessageStore(
    useShallow((state) => state.pageMsg.location),
  );
  return (
    <div className="ios-frame">
      <div className="ios-frame__hair">
        <div className="ios-top">
          <p className="ios-top-left">{time}</p>
          <p className="ios-top-center">
            <p className="ios-top-forehead" />
          </p>
          <p className="ios-top-right">
            <Icon component={CellularSVG} />
            <Icon component={BatterySVG} className="ios-battery" />
          </p>
        </div>
        <div className="ios-url">
          <div className="ios-url-input" title={pageLocation?.href}>
            {pageLocation?.href}
          </div>
        </div>
      </div>
      <div className="ios-frame__content">{children}</div>
      <div className="ios-frame__bottom">
        <div className="ios-home" />
      </div>
    </div>
  );
};

const AndroidFrame = ({ children }: PropsWithChildren<unknown>) => {
  const time = getTime();
  const pageLocation = useSocketMessageStore(
    useShallow((state) => state.pageMsg.location),
  );

  return (
    <div className="android-frame">
      <div className="android-frame__camera" />
      <div className="android-frame__top">
        <p className="android-frame__top-left">{time}</p>
        <p className="android-frame__top-right">
          <Icon component={CellularSVG} />
          <Icon component={BatterySVG} className="android-battery" />
        </p>
      </div>

      <div className="android-url">
        <div className="android-url-input" title={pageLocation?.href}>
          {pageLocation?.href}
        </div>
      </div>
      <div className="android-frame__content">{children}</div>
      <div className="android-frame__bottom">
        <div className="android-home" />
      </div>
    </div>
  );
};

export const MobileFrame = ({
  os,
  children,
  loading,
  onRefresh,
}: PropsWithChildren<FrameWrapperProps>) => {
  const { t: ct } = useTranslation();

  const PhoneFrame = os === 'iOS' ? IOSFrame : AndroidFrame;
  return (
    <div className="mobile-frame">
      <div className="mobile-frame__left spin-container">
        <Spin spinning={loading} className="spin-controller" />
        <PhoneFrame>{children}</PhoneFrame>
      </div>
      <div className="mobile-frame__middle">
        <Space direction="vertical">
          <Button
            style={{ position: 'relative', zIndex: 10 }}
            onClick={() => {
              if (loading) return;
              onRefresh();
            }}
          >
            {ct('refresh')}
          </Button>
        </Space>
      </div>
      <div className="mobile-frame__right spin-container">
        <Spin spinning={loading} className="spin-controller" />
        <ElementPanel />
      </div>
    </div>
  );
};
