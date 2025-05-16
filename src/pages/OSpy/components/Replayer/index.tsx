import { LogReplayer } from '@/components/LogReplayer';
import { useMemo, useState, useEffect, useRef } from 'react';
import './index.less';
import { Button, Flex, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useSize } from 'ahooks';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import demo from './demo.json?url';
import { SelectLogButton } from '@/components/SelectLogButton';

// 用于全局记录是否已经显示过提示
const hasShownMobileTip = {
  value: false,
};

export const Replayer = () => {
  const { t } = useTranslation();
  const size = useSize(document.body);
  const navigate = useNavigate();
  const { search } = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const firstRenderRef = useRef(true);

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

  const replayUrl = useMemo(() => {
    const url = new URLSearchParams(search).get('url');
    if (url === 'demo') return demo;
    return url || '';
  }, [search]);

  const backSlot = useMemo(() => {
    return (
      <Space>
        <Link to="/o-spy">
          <Button
            icon={<ArrowLeftOutlined />}
            size={isMobile ? 'small' : 'middle'}
            className={isMobile ? 'mobile-back-btn' : ''}
          >
            {t('common.back')}
          </Button>
        </Link>
        <SelectLogButton
          onSelect={(url) => {
            navigate(`?url=${url}`);
          }}
        />
      </Space>
    );
  }, [navigate, t, isMobile]);

  // 只在首次加载并且是移动端时显示提示消息
  useEffect(() => {
    if (isMobile && firstRenderRef.current && !hasShownMobileTip.value) {
      message.info({
        content: t('oSpy.better-on-pc'),
        icon: <InfoCircleOutlined />,
        duration: 3,
      });
      // 标记已经显示过提示
      hasShownMobileTip.value = true;
    }
    firstRenderRef.current = false;
  }, [isMobile, t]);

  return (
    <div className={`replayer-container ${isMobile ? 'mobile-view' : ''}`}>
      <LogReplayer url={replayUrl} backSlot={backSlot} />
    </div>
  );
};
