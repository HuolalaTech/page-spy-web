import './index.less';
import { Welcome } from './components/Welcome';
import { Replayer } from './components/Replayer';
import useSearch from '@/utils/useSearch';
import { has } from 'lodash-es';
import { DropFile } from './components/DropFile';
import { useNavigate } from 'react-router-dom';

export const OSpy = () => {
  const navigate = useNavigate();
  const search = useSearch();

  return (
    <div className="o-spy">
      <DropFile
        onDrop={(url) => {
          navigate(`?url=${url}`);
        }}
      />
      {has(search, 'url') ? <Replayer /> : <Welcome />}
    </div>
  );
};
