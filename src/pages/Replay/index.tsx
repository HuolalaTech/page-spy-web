import useSearch from '@/utils/useSearch';
import { LogReplayer } from '@/components/LogReplayer';

const Replay = () => {
  const { url } = useSearch();

  return <LogReplayer url={url} />;
};

export default Replay;
