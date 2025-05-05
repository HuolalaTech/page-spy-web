import { memo, useEffect } from 'react';
import { Empty } from 'antd';
import SystemContent from '@/components/SystemContent';
import { useReplayStore } from '@/store/replay';
import './index.less';

export const SystemPanel = memo(() => {
  const systemMsg = useReplayStore((state) => state.allSystemMsg);

  if (systemMsg.length === 0) {
    return <Empty description={false} />;
  }
  return (
    <div className="replay-system-panel">
      <div className="replay-system-panel__content">
        <SystemContent data={systemMsg} />
      </div>
    </div>
  );
});
