import { LogReplayer } from '@/components/LogReplayer';
import { useEffect, useMemo } from 'react';
import './index.less';
import { Button, Flex, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useSize } from 'ahooks';
import { Link, useNavigate } from 'react-router-dom';
import useSearch from '@/utils/useSearch';
import demo from './demo.json?url';
import { SelectLogButton } from '@/components/SelectLogButton';

export const Replayer = () => {
  const { t } = useTranslation();
  const size = useSize(document.body);
  const navigate = useNavigate();

  const { url } = useSearch();
  const replayUrl = useMemo(() => {
    if (url === 'demo') return demo;
    if (!url) return '';
    return url;
  }, [url]);

  const backSlot = useMemo(() => {
    return (
      <Space>
        <Link to="/o-spy">
          <Button icon={<ArrowLeftOutlined />}>{t('common.back')}</Button>
        </Link>
        <SelectLogButton
          onSelect={(url) => {
            navigate(`?url=${url}`);
          }}
        />
      </Space>
    );
  }, [navigate, t]);

  if (Number(size?.width) <= 768) {
    return (
      <Flex
        vertical
        justify="center"
        align="center"
        style={{ height: '100%', paddingInline: 20 }}
        gap={24}
      >
        <h2>{t('oSpy.only-pc')}</h2>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            navigate('/o-spy');
          }}
        >
          {t('common.back')}
        </Button>
      </Flex>
    );
  }
  return (
    <div className="replayer-container">
      <LogReplayer url={replayUrl} backSlot={backSlot} />
    </div>
  );
};
