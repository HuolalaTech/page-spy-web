import { IntroBlock1 } from './components/Block-1';
import { IntroBlock2 } from './components/Block-2';
import './index.less';

export const Introduction = () => {
  return (
    <div className="introduction">
      <IntroBlock1 />
      <IntroBlock2 />
    </div>
  );
};
