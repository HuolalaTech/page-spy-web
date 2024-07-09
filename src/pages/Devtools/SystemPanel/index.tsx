import { memo } from 'react';
import { Empty } from 'antd';
import { useSocketMessageStore } from '@/store/socket-message';
import SystemContent from '@/components/SystemContent';

const SystemPanel = memo(() => {
  const systemMsg = useSocketMessageStore((state) => state.systemMsg);

  if (systemMsg.length === 0) {
    return <Empty description={false} />;
  }
  return (
    <div className="system-panel">
      <SystemContent data={systemMsg} />
    </div>
  );
});

export default SystemPanel;
