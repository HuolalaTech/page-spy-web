import './index.less';
import { Welcome } from './components/Welcome';
import { Replayer } from './components/Replayer';
import useSearch from '@/utils/useSearch';
import { has } from 'lodash-es';

export const OSpy = () => {
  const search = useSearch();

  return (
    <div className="o-spy">
      {has(search, 'url') ? <Replayer /> : <Welcome />}
    </div>
  );
};
