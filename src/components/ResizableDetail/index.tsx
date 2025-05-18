import { useCacheDetailStore } from '@/store/cache-detail';
import { HolderOutlined } from '@ant-design/icons';
import ReactJsonView from '@huolala-tech/react-json-view';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Resizable } from 'react-resizable';
import './index.less';

export const ResizableDetail = () => {
  const { t } = useTranslation();

  const detailInfo = useCacheDetailStore((state) => state.currentDetail);
  const [detailSize, setDetailSize] = useState(100);

  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState(false);
  // 存储窗口高度的50%，用于计算最大高度
  const [mobileMaxHeight, setMobileMaxHeight] = useState(
    window.innerHeight * 0.5,
  );

  // 在移动端默认高度更小
  useEffect(() => {
    // 移动端40px（默认小高度），PC端80px
    const initialHeight = isMobile ? 40 : 80;
    setDetailSize(initialHeight);
  }, [isMobile]);

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      // 移动端下最大高度为屏幕的50%
      setMobileMaxHeight(window.innerHeight * 0.5);
    };

    // 初始检查
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 为移动端创建自定义的拖动句柄
  const ResizeHandle = useMemo(() => {
    if (isMobile) {
      return (
        <div className="resizable-height-controller">
          {/* 移动端显示下划线指示器 */}
        </div>
      );
    }

    return (
      <div className="resizable-height-controller">
        <HolderOutlined
          style={{
            transform: 'rotateZ(90deg)',
            color: '#aaa',
            fontSize: 16,
          }}
        />
      </div>
    );
  }, [isMobile]);

  return (
    <Resizable
      axis="y"
      resizeHandles={['n']}
      height={detailSize}
      handle={ResizeHandle}
      onResize={(_, info) => {
        const { height } = info.size;
        // 在移动设备上限制高度范围，将最大高度设置为窗口高度的50%
        const maxHeight = isMobile ? mobileMaxHeight : 500;
        const minHeight = isMobile ? 30 : 50;

        if (height > maxHeight || height < minHeight) return;

        setDetailSize(height);
      }}
    >
      <div className="resizable-detail">
        <div
          style={{
            height: detailSize,
            overflowY: 'auto',
            padding: isMobile ? 4 : 8,
          }}
        >
          {detailInfo ? (
            <div
              className={`json-view-container ${
                isMobile ? 'json-view-mobile' : ''
              }`}
            >
              <ReactJsonView source={detailInfo} defaultExpand={1} />
            </div>
          ) : (
            <div className="resizable-empty-detail">
              {t('storage.empty-detail')}
            </div>
          )}
        </div>
      </div>
    </Resizable>
  );
};
