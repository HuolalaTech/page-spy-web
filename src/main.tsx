import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/assets/style/union.less';
import '@/assets/style/initial.css';
import '@/assets/locales/index';

const root = ReactDOM.createRoot(document.querySelector('#root')!);

root.render(<App />);
