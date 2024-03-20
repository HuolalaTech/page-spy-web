import { memo, useEffect } from 'react';
import { Empty } from 'antd';
import SystemContent from '@/components/SystemContent';
import { useReplayStore } from '@/store/replay';

export const SystemPanel = memo(() => {
  const systemMsg = useReplayStore((state) => state.allSystemMsg);

  if (systemMsg.length === 0) {
    return <Empty description={false} />;
  }
  return (
    <div className="system-panel" style={{ padding: 20 }}>
      <SystemContent data={systemMsg} />
    </div>
  );
});
