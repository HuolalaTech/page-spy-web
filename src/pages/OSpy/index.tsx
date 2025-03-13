import './index.less';
import { Welcome } from './components/Welcome';
import { Replayer } from './components/Replayer';
import useSearch from '@/utils/useSearch';
import { has } from 'lodash-es';
import { useRef } from 'react';
import { DropFile } from './components/DropFile';
import { useNavigate } from 'react-router-dom';

export const OSpy = () => {
  const navigate = useNavigate();
  const search = useSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="o-spy" ref={containerRef}>
      <DropFile
        onDrop={(url) => {
          navigate(`?url=${url}`);
        }}
        container={containerRef}
      />
      {has(search, 'url') ? <Replayer /> : <Welcome />}
    </div>
  );
};
