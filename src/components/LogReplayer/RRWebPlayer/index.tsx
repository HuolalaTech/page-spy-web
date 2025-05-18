import { useEventListener } from '@/utils/useEventListener';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PLAYER_SIZE_CHANGE,
  REPLAY_PROGRESS_SKIP,
  REPLAY_STATUS_CHANGE,
} from '../events';
import { useReplayStore } from '@/store/replay';
import rrwebPlayer from 'rrweb-player';
import './index.less';
import { useShallow } from 'zustand/react/shallow';
import { ReplayerEvents } from '@rrweb/types';
import { isRRWebClickEvent, isRRWebMetaEvent } from '@/utils/rrweb-event';
import ClickEffectSvg from '@/assets/image/click-effect.svg?raw';
import clsx from 'clsx';
import { isMobile } from '@/utils/brand';
import { 
  FullscreenExitOutlined, 
  FullscreenOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  RedoOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';

// 自定义事件：全屏状态改变
export const FULLSCREEN_CHANGE_EVENT = 'fullscreen-change';

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

export const RRWebPlayer = memo(() => {
  const rootEl = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerInstance = useRef<rrwebPlayer>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRecoveryButton, setShowRecoveryButton] = useState(false);
  const controlsTimerRef = useRef<number | null>(null);
  const orientationLockRef = useRef<Promise<void> | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState(1);

  const [allRRwebEvent, speed, metaMsg, rrwebStartTime, setRRWebStartTime, setSpeed] =
    useReplayStore(
      useShallow((state) => [
        state.allRRwebEvent,
        state.speed,
        state.metaMsg,
        state.rrwebStartTime,
        state.setRRWebStartTime,
        state.setSpeed,
      ]),
    );

  // 检测当前是否为移动设备
  const [isMobileDevice, setIsMobileDevice] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const platformClass = useMemo(() => {
    return isMobile(metaMsg?.ua) ? 'is-mobile' : 'is-pc';
  }, [metaMsg]);

  const events = useMemo(() => {
    if (!allRRwebEvent.length) return [];
    return JSON.parse(JSON.stringify(allRRwebEvent));
  }, [allRRwebEvent]);

  // 重建播放器的方法 - 放在其他依赖的hooks之后声明
  const rebuildPlayer = useCallback(() => {
    try {
      if (!rootEl.current || !events.length) {
        console.warn('无法重建播放器: DOM元素或事件数据缺失');
        return;
      }
      
      console.log('开始重建播放器...');
      
      // 清理旧播放器
      if (playerInstance.current) {
        try {
          playerInstance.current.pause();
        } catch (e) {
          // 忽略错误
        }
        playerInstance.current = undefined;
      }
      
      // 清理容器内容
      if (rootEl.current) {
        rootEl.current.innerHTML = '';
      }
      
      // 获取当前状态
      const { progress, isPlaying, duration } = useReplayStore.getState();
      const currentTime = progress * duration;
      
      // 获取尺寸
      const { width, height } = rootEl.current.getBoundingClientRect();
      
      // 重新创建播放器
      playerInstance.current = new rrwebPlayer({
        target: rootEl.current,
        props: {
          events,
          width,
          height,
          speed: 1,
          speedOption: [1],
          autoPlay: false,
          skipInactive: false,
          showController: false,
          mouseTail: {
            lineWidth: 3,
            strokeStyle: 'rgb(132, 52, 233)',
            duration: 400,
          },
          UNSAFE_replayCanvas: true,
        },
      });
      
      // 恢复播放位置和状态
      setTimeout(() => {
        if (playerInstance.current) {
          try {
            playerInstance.current.goto(currentTime, isPlaying);
            console.log('播放器重建成功，恢复到', currentTime, isPlaying ? '播放' : '暂停', '状态');
          } catch (e) {
            console.error('恢复播放位置失败:', e);
            
            // 如果需要播放但goto失败，尝试直接播放
            if (isPlaying) {
              try {
                playerInstance.current.play();
              } catch (playErr) {
                console.error('直接播放失败:', playErr);
              }
            }
          }
        }
      }, 100);
    } catch (error) {
      console.error('重建播放器过程中发生错误:', error);
    }
  }, [events]);

  // 重置播放位置的可靠方法
  const resetPlayerPosition = useCallback((player: rrwebPlayer | undefined, forcePlay?: boolean) => {
    if (!player) return;
    
    try {
      // 获取当前状态
      const state = useReplayStore.getState();
      const { progress, duration, isPlaying } = state;
      
      // 确保有效值
      if (typeof progress !== 'number' || typeof duration !== 'number') {
        console.warn('无效的播放进度或时长');
        return;
      }
      
      // 计算时间点
      const currentTime = progress * duration;
      
      // 使用超时确保DOM和播放器状态已更新
      setTimeout(() => {
        try {
          // 恢复进度
          player.goto(currentTime, forcePlay === true ? true : isPlaying);
        } catch (gotoErr) {
          console.error('重置播放位置失败:', gotoErr);
          
          // 备用方法：如果恢复位置失败但需要播放，直接调用play()
          if (forcePlay === true || isPlaying) {
            try {
              player.play();
            } catch (playErr) {
              console.error('备用播放方法也失败:', playErr);
            }
          }
        }
      }, 150);
    } catch (error) {
      console.error('重置播放位置过程错误:', error);
    }
  }, []);

  const onGoto = useCallback(() => {
    const player = playerInstance.current;
    if (!player) return;

    const { isPlaying, progress, duration } = useReplayStore.getState();

    let where = progress * duration;
    if (metaMsg?.startTime && metaMsg.startTime > rrwebStartTime) {
      where += metaMsg.startTime - rrwebStartTime;
    }

    player.goto(where, isPlaying);
  }, [metaMsg, rrwebStartTime]);

  useEventListener(REPLAY_STATUS_CHANGE, onGoto);
  useEventListener(REPLAY_PROGRESS_SKIP, onGoto);

  useEventListener(PLAYER_SIZE_CHANGE, () => {
    if (isFullscreen) return; // 全屏模式下不改变尺寸
    const { width, height } = rootEl.current!.getBoundingClientRect();
    (playerInstance.current as any)?.$set({
      width,
      height,
    });
    playerInstance.current?.triggerResize();
  });

  useEffect(() => {
    playerInstance.current?.setSpeed(speed);
  }, [speed]);

  const [isPc, setIsPc] = useState(true);
  useEffect(() => {
    const root = rootEl.current;
    if (!root || !events.length || playerInstance.current) return;

    try {
    const { width, height } = root.getBoundingClientRect();

    // eslint-disable-next-line new-cap
    playerInstance.current = new rrwebPlayer({
      target: root,
      props: {
        events,
        width,
        height,
        speed: 1,
        speedOption: [1],
        autoPlay: false,
        skipInactive: false,
        showController: false,
        mouseTail: {
          lineWidth: 3,
          strokeStyle: 'rgb(132, 52, 233)',
          duration: 400,
        },
        UNSAFE_replayCanvas: true,
        insertStyleRules: [
          `.click-effect {
            position: fixed;
            width: 40px;
            height: 40px;
            font-size: 12px;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 10000000;
          }`,
        ],
      },
    });
      
      try {
    const replayer = playerInstance.current.getReplayer();
    const { startTime } = replayer.getMetaData();

    setRRWebStartTime(startTime);
        
        try {
    const doc = replayer.iframe.contentDocument!;
    const clickEffect = document.createElement('div');
    clickEffect.classList.add('click-effect');
    clickEffect.innerHTML = ClickEffectSvg;

    replayer.on(ReplayerEvents.EventCast, (event) => {
            try {
      if (isRRWebMetaEvent(event)) {
        setIsPc(event.data.width > 820);
      }
      if (isRRWebClickEvent(event)) {
        const { x, y } = event.data;
        clickEffect.style.left = `${x}px`;
        clickEffect.style.top = `${y}px`;

        const appendDiv = doc.body.appendChild(clickEffect);

        setTimeout(() => {
          appendDiv.remove();
        }, 150);
              }
            } catch (eventErr) {
              console.error('处理回放事件错误:', eventErr);
            }
          });
        } catch (docErr) {
          console.error('访问iframe内容错误:', docErr);
        }
        
        // 初始化同步播放状态
        try {
          const { isPlaying, progress, duration } = useReplayStore.getState();
          if (isPlaying) {
            // 如果应该播放，则立即开始播放
            setTimeout(() => {
              try {
                playerInstance.current?.play();
              } catch (playErr) {
                console.error('初始化播放失败:', playErr);
              }
            }, 100);
          } else if (progress > 0) {
            // 如果有进度但不是播放状态，则跳转到对应位置
            const currentTime = progress * duration;
            setTimeout(() => {
              try {
                playerInstance.current?.goto(currentTime, false);
              } catch (gotoErr) {
                console.error('初始化跳转失败:', gotoErr);
              }
            }, 100);
          }
        } catch (stateErr) {
          console.error('同步初始播放状态失败:', stateErr);
        }
      } catch (replayerErr) {
        console.error('获取回放器实例失败:', replayerErr);
      }
    } catch (initErr) {
      console.error('初始化播放器失败:', initErr);
    }
  }, [events, setRRWebStartTime]);

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

  // 确保退出全屏后页面不会空白，并保持正确的播放进度
  useEffect(() => {
    // 全屏状态变化事件处理器
    const handleFullscreenChange = () => {
      // 检测系统全屏状态与组件内状态是否同步
      const isDocFullscreen = !!document.fullscreenElement;
      
      if (isFullscreen !== isDocFullscreen) {
        // 如果不同步，更新组件状态
        console.log('同步全屏状态:', isDocFullscreen);
        setIsFullscreen(isDocFullscreen);
        
        // 派发全屏状态改变事件，确保主组件能接收到
        window.dispatchEvent(
          new CustomEvent(FULLSCREEN_CHANGE_EVENT, {
            detail: { isFullscreen: isDocFullscreen },
          })
        );
        
        // 退出全屏时进行额外处理
        if (!isDocFullscreen) {
          // 标记退出全屏事件
          console.log('检测到退出全屏事件');
          
          // 立即更新DOM结构以确保元素可见
          const footerElement = document.querySelector('.replay-footer');
          if (footerElement) {
            footerElement.classList.remove('hidden');
            (footerElement as HTMLElement).style.display = 'flex';
            (footerElement as HTMLElement).style.opacity = '1';
            (footerElement as HTMLElement).style.transform = 'translateY(0)';
          }
          
          const replayElement = document.querySelector('.replay');
          if (replayElement) {
            replayElement.classList.remove('with-fullscreen-player');
          }
          
          // 延迟处理，确保DOM已更新
          requestAnimationFrame(() => {
            try {
              if (rootEl.current) {
                // 触发强制重渲染
                window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
                
                // 获取当前播放状态
                const { progress, isPlaying, duration } = useReplayStore.getState();
                const currentTime = progress * duration;
                
                // 延迟调整播放器
                const adjustPlayer = () => {
                  // 多级保护：重渲染播放器容器
                  if (rootEl.current) {
                    // 用当前存在的播放器先调整大小
                    if (playerInstance.current) {
                      try {
                        const { width, height } = rootEl.current.getBoundingClientRect();
                        // 确保宽度和高度有有效值
                        if (width > 0 && height > 0) {
                          (playerInstance.current as any)?.$set({
                            width,
                            height,
                          });
                          playerInstance.current.triggerResize();
                          
                          // 尝试恢复播放位置
                          resetPlayerPosition(playerInstance.current);
                          
                          // 额外保证：如果应该播放，确保在播放
                          if (isPlaying && playerInstance.current) {
                            try {
                              playerInstance.current.play();
                            } catch (playErr) {
                              console.error('恢复播放失败:', playErr);
                            }
                          }
                        } else {
                          console.warn('无效的容器尺寸，等待重试');
                        }
                      } catch (err) {
                        console.error('全屏退出后调整大小失败:', err);
                      }
                    }
                    
                    // 如果播放器容器为空，可能需要重建
                    if (rootEl.current.childElementCount === 0) {
                      console.warn('播放器容器为空，尝试重建播放器');
                      
                      // 清除旧播放器实例
                      if (playerInstance.current) {
                        try {
                          playerInstance.current.pause();
                        } catch(e) {
                          console.error('暂停旧播放器失败:', e);
                        }
                      }
                      
                      // 释放引用
                      playerInstance.current = undefined;
                      
                      // 尝试重建播放器
                      if (events.length > 0) {
                        rebuildPlayer();
                      }
                    }
                  }
                };
                
                // 多次尝试调整以确保成功
                setTimeout(adjustPlayer, 50);
                setTimeout(adjustPlayer, 150);
                setTimeout(adjustPlayer, 300);
              }
            } catch (err) {
              console.error('全屏变化后处理错误:', err);
            }
          });
        }
      }
    };
    
    // 监听系统全屏状态变化
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // 针对全屏状态变化的特定处理
    if (isFullscreen === false) {
      // 退出全屏模式时，多次尝试恢复
      const restorePlayer = () => {
        try {
          if (rootEl.current && playerInstance.current) {
            const { width, height } = rootEl.current.getBoundingClientRect();
            
            // 重设大小
            (playerInstance.current as any)?.$set({
              width,
              height,
            });
            playerInstance.current.triggerResize();
            
            // 恢复播放位置
            resetPlayerPosition(playerInstance.current);
            
            // 重新发送全屏状态变化事件，确保主组件接收到
            window.dispatchEvent(
              new CustomEvent(FULLSCREEN_CHANGE_EVENT, {
                detail: { isFullscreen: false },
              })
            );
          }
        } catch (err) {
          console.error('恢复播放器状态错误:', err);
        }
      };
      
      // 多次尝试，增加成功概率
      requestAnimationFrame(restorePlayer);
      setTimeout(restorePlayer, 100);
      setTimeout(restorePlayer, 300);
      setTimeout(restorePlayer, 500);
      setTimeout(restorePlayer, 1000);
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, resetPlayerPosition, events, rebuildPlayer]);

  // 添加一个额外的监听器，处理视图可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 当页面重新变为可见时检查播放器状态
        setTimeout(() => {
          try {
            if (rootEl.current && rootEl.current.childElementCount === 0 && !isFullscreen) {
              console.warn('页面可见时检测到播放器容器为空，尝试重建');
              
              // 触发强制重渲染
              window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
              
              // 清理和重建播放器实例
              if (playerInstance.current) {
                try {
                  playerInstance.current.pause();
                } catch (e) {
                  // 忽略错误
                }
                playerInstance.current = undefined;
              }
              
              // 重新设置事件以触发初始化
              if (events.length > 0) {
                const { progress, isPlaying, duration } = useReplayStore.getState();
                const currentTime = progress * duration;
                
                setTimeout(() => {
                  const { width, height } = rootEl.current!.getBoundingClientRect();
                  
                  try {
                    playerInstance.current = new rrwebPlayer({
                      target: rootEl.current!,
                      props: {
                        events,
                        width,
                        height,
                        speed: 1,
                        speedOption: [1],
                        autoPlay: false,
                        skipInactive: false,
                        showController: false,
                        mouseTail: {
                          lineWidth: 3,
                          strokeStyle: 'rgb(132, 52, 233)',
                          duration: 400,
                        },
                        UNSAFE_replayCanvas: true,
                      },
                    });
                    
                    setTimeout(() => {
                      if (playerInstance.current) {
                        try {
                          playerInstance.current.goto(currentTime, isPlaying);
                        } catch (e) {
                          if (isPlaying) {
                            try {
                              playerInstance.current.play();
                            } catch (e) {
                              // 忽略错误
                            }
                          }
                        }
                      }
                    }, 100);
                  } catch (e) {
                    console.error('可见性变化重建播放器失败:', e);
                  }
                }, 50);
              }
            } else if (rootEl.current && playerInstance.current && !isFullscreen) {
              // 如果播放器存在，确保尺寸正确
              const { width, height } = rootEl.current.getBoundingClientRect();
              (playerInstance.current as any)?.$set({
                width,
                height,
              });
              playerInstance.current.triggerResize();
              resetPlayerPosition(playerInstance.current);
            }
          } catch (err) {
            console.error('可见性变化处理错误:', err);
          }
        }, 300);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFullscreen, events, resetPlayerPosition]);

  // 处理全屏切换
  const toggleFullscreen = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    try {
      const newFullscreenState = !isFullscreen;
      setIsFullscreen(newFullscreenState);
      
      // 锁定/解锁屏幕方向
      await lockScreenOrientation(newFullscreenState);
      
      // 进入全屏时立即显示控件，然后淡出
      if (newFullscreenState) {
        setShowControls(true);
        if (controlsTimerRef.current) {
          clearTimeout(controlsTimerRef.current);
        }
        controlsTimerRef.current = window.setTimeout(() => {
          setShowControls(false);
        }, 3000);
        
        // 如果是移动设备，添加特殊处理
        if (isMobileDevice) {
          // 尝试请求设备进入全屏模式
          try {
            if (document.documentElement.requestFullscreen) {
              await document.documentElement.requestFullscreen();
            }
          } catch (err) {
            console.error('全屏请求失败:', err);
          }
          
          // 给浏览器一点时间来适应变化
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollIntoView({ behavior: 'smooth' });
              
              // 强制等待DOM更新完成
              requestAnimationFrame(() => {
                try {
                  if (rootEl.current && playerInstance.current) {
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    // 使用局部变量避免null检查错误
                    const player = playerInstance.current;
                    // 调整播放器尺寸以适应全屏
                    (player as any)?.$set({
                      width: viewportWidth,
                      height: viewportHeight,
                    });
                    player.triggerResize();
                    
                    // 保持当前播放位置
                    resetPlayerPosition(player);
                  }
                } catch (err) {
                  console.error('调整全屏播放器尺寸失败:', err);
                }
              });
            }
          }, 300);
        } else {
          // 非移动设备全屏处理
          setTimeout(() => {
            if (rootEl.current && playerInstance.current) {
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;
              
              // 调整播放器尺寸以适应全屏
              try {
                const player = playerInstance.current;
                (player as any)?.$set({
                  width: viewportWidth,
                  height: viewportHeight,
                });
                player.triggerResize();
                
                // 保持当前播放位置
                resetPlayerPosition(player);
              } catch (err) {
                console.error('调整全屏播放器尺寸失败:', err);
              }
            }
          }, 200);
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
        
        // 退出全屏时确保播放器重新调整大小
        setTimeout(() => {
          // 使用 PLAYER_SIZE_CHANGE 事件触发重新调整大小
          window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
        }, 300);
      }
      
      // 派发全屏状态改变事件 - 重要：确保主组件能够正确响应全屏状态变化
      console.log('发送全屏状态改变事件:', newFullscreenState);
      window.dispatchEvent(
        new CustomEvent(FULLSCREEN_CHANGE_EVENT, {
          detail: { isFullscreen: newFullscreenState },
        })
      );
      
      // 全屏状态改变后，需要调整播放器大小并确保回放位置正确
      setTimeout(() => {
        try {
          if (rootEl.current && playerInstance.current) {
            const { width, height } = rootEl.current.getBoundingClientRect();
            
            // 保存当前播放状态和位置
            let currentProgress = 0;
            let currentIsPlaying = false;
            
            try {
              const replayState = useReplayStore.getState();
              currentProgress = replayState.progress;
              currentIsPlaying = replayState.isPlaying;
            } catch (stateErr) {
              console.error('获取播放状态失败:', stateErr);
            }
            
            const player = playerInstance.current;
            
            // 调整大小
            try {
              (player as any)?.$set({
                width,
                height,
              });
              player.triggerResize();
            } catch (resizeErr) {
              console.error('调整播放器大小失败:', resizeErr);
            }
            
            // 恢复播放位置和状态
            try {
              if (player.getReplayer && typeof currentProgress === 'number') {
                const replayer = player.getReplayer();
                if (replayer) {
                  // 计算当前时间点
                  const { duration } = useReplayStore.getState();
                  const currentTime = currentProgress * duration;
                  
                  // 设置回放位置
                  setTimeout(() => {
                    try {
                      player.goto(currentTime, currentIsPlaying);
                    } catch (gotoErr) {
                      console.error('恢复播放位置失败:', gotoErr);
                      // 如果恢复失败，尝试直接设置状态
                      if (currentIsPlaying) {
                        try {
                          player.play();
                        } catch (e) {
                          console.error('重新开始播放失败:', e);
                        }
                      }
                    }
                  }, 50);
                }
              }
            } catch (playerErr) {
              console.error('操作播放器失败:', playerErr);
            }
          }
        } catch (err) {
          console.error('全屏切换后处理播放器错误:', err);
        }
      }, 200);
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

  // 处理播放/暂停
  const togglePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    try {
      const player = playerInstance.current;
      if (!player) return;
      
      const state = useReplayStore.getState();
      const newPlayState = !state.isPlaying;
      
      // 先更新状态
      useReplayStore.setState({ isPlaying: newPlayState });
      setIsPlaying(newPlayState);
      
      // 然后控制播放器
      setTimeout(() => {
        try {
          if (newPlayState) {
            player.play();
          } else {
            player.pause();
          }
        } catch (err) {
          console.error('控制播放状态失败:', err);
        }
      }, 0);
    } catch (error) {
      console.error('切换播放状态失败:', error);
    }
  }, []);

  // 监听播放状态
  useEffect(() => {
    const unsub = useReplayStore.subscribe(
      (state) => {
        setIsPlaying(state.isPlaying);
      }
    );
    
    return unsub;
  }, []);

  // 初始化播放状态
  useEffect(() => {
    const { isPlaying } = useReplayStore.getState();
    setIsPlaying(isPlaying);
  }, []);
  
  // 处理点击事件，显示控制按钮（仅全屏模式下）
  const handlePlayerClick = useCallback(() => {
    if (!isFullscreen) return;
    
    setShowControls(true);
    
    // 清除之前的定时器
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    
    // 3秒后自动隐藏控制按钮
    controlsTimerRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [isFullscreen]);

  // 处理双击事件 - 退出全屏
  const handleDoubleClick = useCallback(async (e: React.MouseEvent) => {
    if (isFullscreen) {
      e.stopPropagation();
      // 退出全屏
      setIsFullscreen(false);
      
      // 解锁屏幕方向
      await lockScreenOrientation(false);
      
      // 退出系统全屏
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.error('退出全屏失败:', err);
        }
      }
      
      // 通知全屏状态变化 - 确保发送多次，增加接收成功率
      window.dispatchEvent(
        new CustomEvent(FULLSCREEN_CHANGE_EVENT, {
          detail: { isFullscreen: false },
        })
      );
      
      // 延迟发送一次，确保接收方能收到
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(FULLSCREEN_CHANGE_EVENT, {
            detail: { isFullscreen: false },
          })
        );
      }, 100);
      
      // 重新调整大小
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
      }, 300);
    }
  }, [isFullscreen, lockScreenOrientation]);

  // 全屏时处理ESC键
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        
        // 解锁屏幕方向
        await lockScreenOrientation(false);
        
        window.dispatchEvent(
          new CustomEvent(FULLSCREEN_CHANGE_EVENT, {
            detail: { isFullscreen: false },
          })
        );
        
        // 使用 PLAYER_SIZE_CHANGE 事件触发重新调整大小
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
          
          if (rootEl.current && playerInstance.current) {
            const { width, height } = rootEl.current.getBoundingClientRect();
            (playerInstance.current as any)?.$set({
              width,
              height,
            });
            playerInstance.current.triggerResize();
          }
        }, 300);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, lockScreenOrientation]);

  // 监听屏幕方向变化
  useEffect(() => {
    // 仅在移动端且支持屏幕方向API时处理
    if (!isMobileDevice || !isScreenOrientationSupported()) return;
    
    const handleOrientationChange = () => {
      // 获取当前方向
      const orientation = (window.screen as ExtendedScreen).orientation;
      const isLandscape = orientation.type.includes('landscape');
      
      // 如果已经是横屏且处于全屏状态，可以考虑更新一些UI状态
      if (isLandscape && isFullscreen) {
        // 在横屏状态下可能需要特别处理某些UI元素
        if (rootEl.current && playerInstance.current) {
          const { width, height } = rootEl.current.getBoundingClientRect();
          (playerInstance.current as any)?.$set({
            width,
            height,
          });
          playerInstance.current.triggerResize();
        }
      }
    };
    
    // 添加屏幕方向变化监听
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobileDevice, isFullscreen]);

  // 全局事件处理器，用于额外的稳定性
  useEffect(() => {
    // 页面可见性变化时重新调整大小
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见时，确保播放器尺寸正确
        setTimeout(() => {
          if (rootEl.current && playerInstance.current) {
            const { width, height } = rootEl.current.getBoundingClientRect();
            const { progress, isPlaying } = useReplayStore.getState();
            const player = playerInstance.current;
            
            (player as any)?.$set({
              width,
              height,
            });
            player.triggerResize();
            
            // 恢复当前播放位置
            const { duration } = useReplayStore.getState();
            const currentTime = progress * duration;
            player.goto(currentTime, isPlaying);
          }
        }, 300);
      }
    };
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 监听窗口大小变化
    const handleResize = () => {
      if (!isFullscreen) {
        window.dispatchEvent(new CustomEvent(PLAYER_SIZE_CHANGE));
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen]);
  
  // 补充播放状态变化的处理
  useEffect(() => {
    const handlePlayStatusChange = () => {
      const { isPlaying } = useReplayStore.getState();
      setIsPlaying(isPlaying);
    };
    
    window.addEventListener(REPLAY_STATUS_CHANGE, handlePlayStatusChange);
    
    return () => {
      window.removeEventListener(REPLAY_STATUS_CHANGE, handlePlayStatusChange);
    };
  }, []);

  // 暴露一个清理方法，在组件卸载前主动释放资源
  const cleanupResources = useCallback(() => {
    if (playerInstance.current) {
      try {
        // 尝试停止播放
        playerInstance.current.pause();
        
        // 清除播放器实例
        if (rootEl.current) {
          rootEl.current.innerHTML = '';
        }
        
        // 其他清理工作
        playerInstance.current = undefined;
      } catch (err) {
        console.error('清理播放器资源失败:', err);
      }
    }
  }, []);
  
  // 组件卸载时清除资源
  useEffect(() => {
    return () => {
      // 清除定时器
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      
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
      
      // 释放播放器资源
      cleanupResources();
    };
  }, [cleanupResources]);

  // 创建一个全局方法，允许从外部触发播放器恢复
  useEffect(() => {
    const handleForceRebuild = () => {
      console.log('接收到强制重建请求');
      rebuildPlayer();
    };
    
    // 监听特定的恢复事件
    window.addEventListener('force-rebuild-player', handleForceRebuild);
    
    // 将恢复方法暴露到全局，以便在控制台中使用
    (window as any).rebuildRRWebPlayer = rebuildPlayer;
    
    return () => {
      window.removeEventListener('force-rebuild-player', handleForceRebuild);
      delete (window as any).rebuildRRWebPlayer;
    };
  }, [rebuildPlayer]);
  
  // 定期检查播放器是否需要恢复
  useEffect(() => {
    if (isFullscreen) {
      // 全屏模式下不检查
      setShowRecoveryButton(false);
      return;
    }
    
    // 每3秒检查一次播放器状态
    const checkInterval = setInterval(() => {
      try {
        if (rootEl.current && (!playerInstance.current || rootEl.current.childElementCount === 0)) {
          // 播放器可能需要恢复
          setShowRecoveryButton(true);
        } else {
          setShowRecoveryButton(false);
        }
      } catch (e) {
        // 忽略错误
      }
    }, 3000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [isFullscreen]);

  // 更新选中的倍速状态
  useEffect(() => {
    setSelectedSpeed(speed);
  }, [speed]);

  // 处理倍速选择
  const handleSpeedChange = useCallback((value: number) => {
    setSelectedSpeed(value);
    setSpeed(value);
  }, [setSpeed]);

  // 倍速选项
  const speedOptions = useMemo(() => [
    { label: '0.5x', value: 0.5 },
    { label: '1.0x', value: 1 },
    { label: '2.0x', value: 2 },
    { label: '3.0x', value: 3 },
    { label: '4.0x', value: 4 },
  ], []);

  // 处理全屏时显示的浮动控件
  useEffect(() => {
    if (isFullscreen) {
      // 全屏模式下显示控件3秒
      setShowControls(true);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      controlsTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isFullscreen]);

  return (
    <div 
      className={clsx(
        'rrweb-player-container',
        isFullscreen ? clsx('fullscreen', isMobileDevice && 'force-landscape') : '',
        isMobileDevice && 'mobile',
        showControls && 'show-controls'
      )}
      ref={containerRef}
      onClick={handlePlayerClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className={clsx('rrweb-player', platformClass)} ref={rootEl} />
      
      {/* 恢复按钮 - 在播放器出现问题时显示 */}
      {showRecoveryButton && !isFullscreen && (
        <div className="recovery-button" onClick={rebuildPlayer}>
          <RedoOutlined /> 恢复播放
        </div>
      )}
      
      {/* 控制按钮 */}
      <div className="player-controls">
        {/* 播放暂停按钮仅在全屏模式下显示 */}
        {isFullscreen && (
          <>
            <div 
              className="play-pause-btn"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <PauseCircleOutlined />
              ) : (
                <PlayCircleOutlined />
              )}
            </div>
            
            {/* 倍速选择器 */}
            <div className="speed-selector">
              <Dropdown
                menu={{
                  items: speedOptions.map(opt => ({
                    key: String(opt.value),
                    label: opt.label,
                    onClick: () => handleSpeedChange(opt.value),
                  })),
                  style: isMobileDevice && isFullscreen ? { transform: 'rotate(90deg)', transformOrigin: 'bottom center' } : {}
                }}
                trigger={['click']}
                placement={isMobileDevice && isFullscreen ? "topRight" : "top"}
                getPopupContainer={() => containerRef.current || document.body}
              >
                <div className="speed-display" onClick={e => e.stopPropagation()}>
                  {selectedSpeed}x <DownOutlined />
                </div>
              </Dropdown>
            </div>
          </>
        )}
        
        {/* 全屏按钮仅在非全屏模式下显示 */}
        {isMobileDevice && !isFullscreen && (
          <div 
            className="fullscreen-toggle"
            onClick={toggleFullscreen}
          >
            <FullscreenOutlined />
          </div>
        )}
      </div>
    </div>
  );
});
