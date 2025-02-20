import { IntroBlock1 } from './components/Block-1';
import { IntroBlock2 } from './components/Block-2';
import { IntroBlock3 } from './components/Block-3';
import './index.less';

export const Introduction = () => {
  return (
    <div className="introduction">
      <IntroBlock1 />
      <IntroBlock2 />
      <IntroBlock3 />
    </div>
  );
};
