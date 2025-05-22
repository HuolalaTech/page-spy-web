import { message, Row, Col, Empty, Flex } from 'antd';
import './index.less';
import { useRequest } from 'ahooks';
import { LoadingFallback } from '@/components/LoadingFallback';
import { PlayControl } from './PlayControl';
import { strToU8, unzlibSync, strFromU8 } from 'fflate';
import { HarborDataItem, useReplayStore } from '@/store/replay';
import { RRWebPlayer } from './RRWebPlayer';
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

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="replay">
      <Row className="replay-header" align="middle">
        <Col span={8}>{backSlot}</Col>
        <Col span={8}>
          <Flex justify="center">
            <Meta />
          </Flex>
        </Col>
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
      <div className="replay-footer">
        <PlayControl />
      </div>

      <ErrorDetailDrawer />
    </div>
  );
};
