import { message, Row, Col, Empty, Flex } from 'antd';
import './index.less';
import { useRequest } from 'ahooks';
import { LoadingFallback } from '@/components/LoadingFallback';
import { PlayControl, CONTROL_COLLAPSE_EVENT } from './PlayControl';
import { strToU8, unzlibSync, strFromU8 } from 'fflate';
import { HarborDataItem, useReplayStore } from '@/store/replay';
import { RRWebPlayer, FULLSCREEN_CHANGE_EVENT } from './RRWebPlayer';
import { PluginPanel } from './PluginPanel';
import '@huolala-tech/react-json-view/dist/style.css';
import request from '@/apis/request';
import {
  ReactNode,
  RefCallback,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import useCallbackRef from '@/utils/useCallbackRef';
import clsx from 'clsx';
import { PLAYER_SIZE_CHANGE } from './events';
import { useEventListener } from '@/utils/useEventListener';
import { useShallow } from 'zustand/react/shallow';
import { ErrorDetailDrawer } from '@/components/ErrorDetailDrawer';
import { Meta } from './Meta';
import { debug } from '@/utils/debug';
import { useTranslation } from 'react-i18next';

interface Props {
  url: string;
  fileId?: string;
  backSlot?: ReactNode;
}

export const LogReplayer = ({ url, fileId, backSlot = null }: Props) => {
  useEffect(() => {
    return () => {
      if (url.startsWith('blob://')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);
  const { t } = useTranslation();

  // 添加移动端检测
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // 添加播放控制收缩状态
  const [controlCollapsed, setControlCollapsed] = useState(false);
  // 添加播放器全屏状态
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);
  
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

  const [allRRwebEvent, setAllData, setIsExpand] = useReplayStore(
    useShallow((state) => [
      state.allRRwebEvent,
      state.setAllData,
      state.setIsExpand,
    ]),
  );

  const { loading, run: requestLog } = useRequest(
    async () => {
      let res: any;
      try {
        let fetchUrl = url;
        const headers: Record<string, string> = {};

        // 处理URL可能包含的fileId
        let extractedFileId = fileId;
        if (
          !extractedFileId &&
          fetchUrl.includes('/api/v1/log/download?fileId=')
        ) {
          try {
            const urlObj = new URL(fetchUrl, window.location.origin);
            const fileIdParam = urlObj.searchParams.get('fileId');
            if (fileIdParam) {
              extractedFileId = fileIdParam;
            }
          } catch (e) {
            console.error('URL解析错误:', e);
          }
        }

        // 添加认证令牌到所有API请求
        if (
          extractedFileId ||
          (fetchUrl && fetchUrl.includes(request.defaultPrefix))
        ) {
          const token = localStorage.getItem('page-spy-auth-token');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          } else {
            throw new Error(t('auth.login_required') || 'Login required');
          }
        }

        // 请求日志数据
        const response = await fetch(fetchUrl, { headers });

        // 检查是否成功
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(t('auth.login_required') || 'Login required');
          }
          throw new Error(
            `${t('replay.fetch-error') || 'Error fetching log'}: ${
              response.statusText
            }`,
          );
        }

        // 解析JSON数据
        res = await response.json();
      } catch (e: any) {
        throw new Error(e.message || t('replay.invalid-source'));
      }
      // source not found, for example, the file be cleared in the server
      if (res?.success === false) {
        throw new Error(res?.message || 'File not found');
      }
      const result = res.map((i: any) => {
        return {
          ...i,
          // if string, it's compressed by zlib
          // or it will be plain object. because in mp env, zlib is not available
          data:
            typeof i.data === 'string'
              ? JSON.parse(strFromU8(unzlibSync(strToU8(i.data, true))))
              : i.data,
        };
      }) as HarborDataItem[];
      debug.log(result);
      setAllData(result);
      return result;
    },
    {
      manual: true,
      onError(e) {
        message.error(e.message);
      },
    },
  );

  useEffect(() => {
    if (url) {
      requestLog();
    }
  }, [requestLog, url]);

  // drag to resize
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

  // 监听播放控制收缩状态变化
  useEffect(() => {
    const handleControlCollapse = (e: CustomEvent) => {
      setControlCollapsed(e.detail.collapsed);
    };
    
    window.addEventListener(CONTROL_COLLAPSE_EVENT, handleControlCollapse as EventListener);
    return () => {
      window.removeEventListener(CONTROL_COLLAPSE_EVENT, handleControlCollapse as EventListener);
    };
  }, []);

  // 监听播放器全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = (e: CustomEvent) => {
      console.log('主组件接收到全屏状态变化:', e.detail.isFullscreen);
      setIsPlayerFullscreen(e.detail.isFullscreen);
      
      // 全屏状态改变后进行DOM更新
      if (!e.detail.isFullscreen) {
        // 退出全屏状态时，确保底部控件可见
        // 立即进行DOM更新，不等待setTimeout
        const footerElement = document.querySelector('.replay-footer');
        if (footerElement) {
          // 移除hidden类
          footerElement.classList.remove('hidden');
          // 重置样式
          (footerElement as HTMLElement).style.display = 'flex';
          (footerElement as HTMLElement).style.opacity = '1';
          (footerElement as HTMLElement).style.transform = 'translateY(0)';
        }
        
        // 重置容器类
        const replayElement = document.querySelector('.replay');
        if (replayElement) {
          replayElement.classList.remove('with-fullscreen-player');
        }
        
        // 延迟再次执行以确保DOM完全更新
        setTimeout(() => {
          // 强制触发重渲染
          if (footerElement) {
            // 强制重绘
            footerElement.classList.add('force-reflow');
            setTimeout(() => {
              footerElement.classList.remove('force-reflow');
            }, 10);
          }
          
          // 通知窗口大小变化以触发播放器适应
          window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
        }, 100);
      }
    };
    
    // 使用事件捕获以确保最早接收到事件
    window.addEventListener(FULLSCREEN_CHANGE_EVENT, handleFullscreenChange as EventListener, true);
    
    // 监听原生全屏事件作为备用
    const handleNativeFullscreenChange = () => {
      const isInFullscreen = !!document.fullscreenElement;
      if (!isInFullscreen && isPlayerFullscreen) {
        // 原生全屏退出但状态未更新时，主动更新状态
        console.log('通过原生事件检测到退出全屏');
        setIsPlayerFullscreen(false);
        
        // 强制显示控件
        const footerElement = document.querySelector('.replay-footer');
        if (footerElement) {
          (footerElement as HTMLElement).style.display = 'flex';
          footerElement.classList.remove('hidden');
          (footerElement as HTMLElement).style.opacity = '1';
          (footerElement as HTMLElement).style.transform = 'translateY(0)';
        }
        
        const replayElement = document.querySelector('.replay');
        if (replayElement) {
          replayElement.classList.remove('with-fullscreen-player');
        }
        
        // 重新触发布局调整
        window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
        
        // 再次延迟以确保界面完全恢复
        setTimeout(() => {
          if (footerElement) {
            // 强制DOM重新评估
            const display = window.getComputedStyle(footerElement).display;
            if (display !== 'flex') {
              (footerElement as HTMLElement).style.display = 'flex';
            }
          }
        }, 300);
      }
    };
    
    // 监听原生全屏事件
    document.addEventListener('fullscreenchange', handleNativeFullscreenChange);
    
    return () => {
      window.removeEventListener(FULLSCREEN_CHANGE_EVENT, handleFullscreenChange as EventListener, true);
      document.removeEventListener('fullscreenchange', handleNativeFullscreenChange);
    };
  }, [isPlayerFullscreen]);

  // 确保控件在非全屏状态正确显示
  useEffect(() => {
    if (!isPlayerFullscreen) {
      setTimeout(() => {
        const footerElement = document.querySelector('.replay-footer');
        if (footerElement) {
          footerElement.classList.remove('hidden');
          (footerElement as HTMLElement).style.display = 'flex';
        }
      }, 200);
    }
  }, [isPlayerFullscreen]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className={clsx("replay", isPlayerFullscreen && "with-fullscreen-player")}>
      <Row className={`replay-header ${isMobile ? 'mobile-header' : ''}`} align="middle">
        <Col span={isMobile ? 12 : 8}>{backSlot}</Col>
        <Col span={isMobile ? 12 : 8}>
          <Flex justify={isMobile ? "flex-end" : "center"}>
            <Meta />
          </Flex>
        </Col>
        {!isMobile && <Col span={8}></Col>}
      </Row>
      <div className="replay-main">
        <div
          className={clsx('replay-main__left', isDragging && 'no-select')}
          ref={bindPlayer}
        >
          {/* Replayer need at least 2 events. */}
          {allRRwebEvent.length >= 2 ? (
            <RRWebPlayer />
          ) : (
            <div style={{ marginTop: 80 }}>
              <Empty />
            </div>
          )}
        </div>
        <div className="replay-main__center" ref={bindDragger} />
        <div className={clsx('replay-main__right', isDragging && 'no-select')}>
          <PluginPanel />
        </div>
      </div>
      <div className={clsx(
        'replay-footer', 
        isMobile && controlCollapsed && 'with-collapsed-control',
        isPlayerFullscreen && 'hidden'
      )}>
        <PlayControl />
      </div>

      <ErrorDetailDrawer />
    </div>
  );
};
