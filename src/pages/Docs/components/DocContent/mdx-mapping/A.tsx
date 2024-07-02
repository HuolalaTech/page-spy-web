import { PropsWithChildren } from 'react';
import { TransitionLink } from '@/components/Transition';
import { useNavigate } from 'react-router-dom';

// 超链接可能使用环境变量，使用格式
// - 正常：[xxx](https://xxx/yyy)
// - 使用变量: [xxx]({VITE_XXX})
// - 相对路径: [xxx](./xxx)
const A = (props: PropsWithChildren<any>) => {
  const navigate = useNavigate();

  const { children, href } = props;

  const decodeHref = decodeURI(href as string);
  const url = decodeHref.replace(/\{VITE_(.*?)\}/, (_, key) => {
    return import.meta.env[`VITE_${key}`];
  });
  if (url.startsWith('http')) {
    return (
      <a href={url} target="_blank">
        {children}
      </a>
    );
  }

  return (
    <TransitionLink
      to={url}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </TransitionLink>
  );
};

export default A;
