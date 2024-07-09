import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/assets/style/union.less';
import '@/assets/style/initial.less';
import '@/assets/locales/index';
import './init';

const root = ReactDOM.createRoot(document.querySelector('#root')!);

root.render(<App />);
