import useSearch from '@/utils/useSearch';
import { LogReplayer } from '@/components/LogReplayer';
import { SelectLogButton } from '@/components/SelectLogButton';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Space, Button } from 'antd';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Replay = () => {
  const { url } = useSearch();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const backSlot = useMemo(() => {
    return (
      <Space>
        <Link to="/log-list">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (url.startsWith('blob://')) {
                URL.revokeObjectURL(url);
              }
            }}
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
  }, [navigate, t, url]);

  return <LogReplayer url={url} backSlot={backSlot} />;
};

export default Replay;
